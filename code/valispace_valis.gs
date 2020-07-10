
function getProjectTree(id){
  var myId = id;
  Logger.log(myId);
  
  // Return Valis from Specific project
  var responseComponents = getAuthenticatedValispaceUrl('components/?project=' + myId);
  var responseMatrices = getAuthenticatedValispaceUrl('matrices/?project=' + myId);
  var responseValis = getAuthenticatedValispaceUrl('valis/?project=' + myId);
  
  const components = JSON.parse(responseComponents.getContentText());
  const valis = JSON.parse(responseValis.getContentText());
  const matrices = JSON.parse(responseMatrices.getContentText());
  
  const cleanedValis = valis.filter(function(d){return (d.data_type === 'vali')});
  
  const parents = components.filter(function(d){return !d.parent;});

  var returnHTML = ""
  
  var i;
  for(i = 0 ; i < parents.length ; i++){
    returnHTML += '<ul class="topUl">' + createTree(components, cleanedValis,matrices, parents[i].id) + '</ul>';
  }
  
  return returnHTML;

}


function createTree(components, valis, matrices, parentID){
  var newHtml = "";
  var currentComponent = components.filter(function(d){return d.id === parentID;})[0];
  
  var deployment = PropertiesService.getUserProperties().getProperty('deployment');
  Logger.log(deployment)
  
  // Insert current component as UL
  newHtml += '<li><span class="caret"><i class="valiIcon fas fa-cube"></i>' + currentComponent.name + '</span>';
  newHtml += '<ul class="nested">'
  var i;
  Logger.log("Creating component");
  Logger.log(parentID);
  Logger.log(matrices);
  for(i = 0 ; i < currentComponent.children.length ; i++){
    newHtml += createTree(components, valis, matrices, currentComponent.children[i]);
  }
  var componentValis = valis.filter(function(d){return d.parent === parentID;});
  var componentMatrices = matrices.filter(function(d){return ((d.parent === parentID) && (d.name.indexOf('link_') != 0));});
  
  for(i = 0 ; i < componentValis.length ; i++){
    var compLink = deployment + '/components/' + parentID + '/properties/vali/' + componentValis[i].id;
    newHtml += '<li class="vali" id="' + compLink + '">χ '+ componentValis[i].shortname + '</li>';
  }
  
  for(i = 0 ; i < componentMatrices.length ; i++){
    newHtml += '<li><span class="caret"><i class="valiIcon fas fa-th"></i>'+ componentMatrices[i].name + '</span>'
    newHtml += '<ul class="nested">';
    
    var row;
    var column;
    for(row = 0 ; row < componentMatrices[i].cells.length ; row++){
      for(column = 0 ; column < componentMatrices[i].cells[row].length ; column++){
         var currentVali = valis.filter(function(d){return d.id === parseInt(this);}, componentMatrices[i].cells[row][column])[0];
         var compLink = deployment + '/components/' + parentID + '/properties/matrix/' + componentMatrices[i].id + '?/vali/'  + currentVali.id; // Todo a completer
         newHtml += '<li class="vali" id="' + compLink + '">χ '+ currentVali.shortname + '</li>';
      }
    }
    newHtml += '</ul></li>';
  }
  
  
  newHtml += '</ul></li>';
  return newHtml; 
  
}





// ****************************************************************************************
// Vali Manipulation
// ****************************************************************************************

function insertVali(link){
  var valiId = link.split("/vali/")[1].split('/')[0];
  var template = HtmlService.createTemplateFromFile('code/valiDialog');
  template.vali = getValiValue(valiId);
  template.link = link;
  var page = template.evaluate();
  page.setHeight(550);
  
  var dialog = DocumentApp.getUi().showModalDialog(page, 'Import Vali');

}


function customizeVali(link){

}

function insertValiWithParams(link, valiJSON , field, displayUnit, decimalPlaces){
  var cursor = DocumentApp.getActiveDocument().getCursor();
  Logger.log("JSON vali");
  Logger.log(displayUnit);
  var vali = JSON.parse(valiJSON);
  
  Logger.log(vali);
  Logger.log(vali[field]);
  var insertedText ="";
  if(field === 'margin_minus'){
     insertedText += "-";
  }
  insertedText += vali[field].toFixed(decimalPlaces);
  
  if (displayUnit){
    if((field==='value') || (field==='wc_plus') || (field==='wc_minus')){
      insertedText += ' ' + vali.unit;
    } else {
      insertedText += ' %';
    }
  }
  
  var offset = cursor.getOffset()
  var cursorElement = cursor.getElement();
  
  var attributes = {}
  if (cursorElement.getType() ===  DocumentApp.ElementType.TEXT){
    attributes = cursorElement.getAttributes(offset);
  } else {
    attributes = {};
    attributes[DocumentApp.Attribute.UNDERLINE] = false;
    attributes[DocumentApp.Attribute.FOREGROUND_COLOR] = "#000000";
  }

  
  var newText2 = cursor.insertText(insertedText);
  
  Logger.log(attributes);
  
  var insertedLink = link;
  insertedLink += "?valiField=" + field + " displayUnit=" + (displayUnit ? "true" : "false"); 
  insertedLink += " nbDecimals=" + decimalPlaces;
  
  delete attributes.LINK_URL;
  
 
  newText2.setLinkUrl(insertedLink);
  newText2.setAttributes(attributes); 
  
  //if highlight true{
  //newText2.setBackgroundColor('#ff0000');
  //}
}


function getValiValue(idVali, allValis){
  var returnVali;
  if (!allValis){
    var responseVali = getAuthenticatedValispaceUrl('valis/' + idVali);
    returnVali = JSON.parse(responseVali.getContentText());
  } else {
    returnVali = allValis.filter(function(d){return d.id === parseInt(this);}, idVali)[0];
  }
  
  return returnVali;
  
}



// Update All Vali links present in the text
function updateValis(element, allValis) {
  var deployment = PropertiesService.getUserProperties().getProperty('deployment');
  if(!element){
    element = DocumentApp.getActiveDocument().getBody();
    allValis = JSON.parse(getAuthenticatedValispaceUrl('valis').getContentText());
  }
  
  
  if (element.getType() === DocumentApp.ElementType.TEXT) {
    var textObj = element.editAsText();
    var inUrl = false;
    var urlJustFinished = false;
    var txtLength = element.getText().length;
    var ch = 0;
    while (ch < txtLength) {
      var url = textObj.getLinkUrl(ch);
      if (url != null) {
        if (!inUrl) {
          inUrl = true;
          var curUrl = {};
          var start = ch;
          curUrl.element = element;
          curUrl.url = String( url ); // grab a copy
          curUrl.startOffset = ch;   
          curUrl.attributes = element.getAttributes(ch);  
          
        }
        else {
          curUrl.endOffsetInclusive = ch;
        }
        
        // If text element finished, URL Finished
        if (ch === txtLength - 1){
          urlJustFinished = true;
          inUrl = false;
        }
        
      }
      // Finished URL
      else {
        if (inUrl) {
          urlJustFinished = true;
          inUrl = false;
        }
      }
      if (urlJustFinished){
        // The Vali ID is at the last position of the link
        
        // Test if this is a valid URL.
        if(curUrl.url.indexOf(deployment+'/components/') === 0){
          try{
            Logger.log("On fait le parse:");
            var splitted = curUrl.url.split("/vali/")[1].split('?');
            Logger.log(splitted);
            var valiId = splitted[0];
            Logger.log(valiId);
            
            var params = splitted[1].split(" ");
            Logger.log(params);
            var field = params[0].split("=")[1];
            Logger.log(field);
            var displayUnit = params[1].split("=")[1];
            Logger.log(displayUnit);
            var nbDecimals;
            try{
              nbDecimals = parseInt(params[2].split("=")[1]);
            } catch (e) { // If decimal is not defined.
              nbDecimals = 2;
              curUrl.url += " nbDecimals=2"
            }
            Logger.log("nbDecimals");
            Logger.log(nbDecimals)
            Logger.log(curUrl.attributes);
            
            
            
            
            var vali = getValiValue(valiId, allValis);
            Logger.log(vali);
            var newTextToInsert = "";
            if(field==='margin_minus'){
              newTextToInsert += "-";
            }
            
            newTextToInsert += vali[field].toFixed(nbDecimals);
            if (displayUnit === "true"){
              if((field==='value') || (field==='wc_plus') || (field==='wc_minus')){
                newTextToInsert += ' ' + vali.unit;
              } else {
                newTextToInsert += ' %';
              }
            }
            Logger.log(newTextToInsert);
            
            
            textObj.deleteText(curUrl.startOffset, curUrl.endOffsetInclusive);    
            textObj.insertText(curUrl.startOffset, newTextToInsert);
            
            var endtxt = curUrl.startOffset + newTextToInsert.length - 1;
            
            
            
            textObj.setLinkUrl(curUrl.startOffset, endtxt, curUrl.url);
            delete curUrl.attributes.LINK_URL;
            
            try{
              if (curUrl.attributes.BACKGROUND_COLOR === null) {
                delete curUrl.attributes.BACKGROUND_COLOR;
              }
            } catch (e) {}
            
            textObj.setAttributes(curUrl.startOffset, endtxt, curUrl.attributes);
            
            //if highlight true{
            //newText2.setBackgroundColor('#ff0000');
            //}
            
            // Updating text length and Position
            txtLength = txtLength + newTextToInsert.length - 1 - (curUrl.endOffsetInclusive - curUrl.startOffset);
            ch = ch + newTextToInsert.length - 1 - (curUrl.endOffsetInclusive - curUrl.startOffset);
          }
          catch (e){
            DocumentApp.getUi().alert(" Problem with vali\n Link: " + curUrl.url + "\nText: " + curUrl.element.getText());
          }
        }
        urlJustFinished = false;
      }
      ch += 1;
    }
  }

    
    // Get number of child elements, for elements that can have child elements. 
    try {
      var numChildren = element.getNumChildren();
    }
    catch (e) {
      numChildren = 0;
    }
    for (var i=0; i<numChildren; i++) {
      updateValis(element.getChild(i), allValis);
    }
}