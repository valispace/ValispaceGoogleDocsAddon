
function getProjectTree(id){
  var myId = id;
  //Logger.log(myId);
  
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
  //Logger.log(deployment)
  
  // Insert current component as UL
  newHtml += '<li><span class="caret"><i class="valiIcon fas fa-cube"></i>' + currentComponent.name + '</span>';
  newHtml += '<ul class="nested">'
  var i;
  //Logger.log("Creating component");
  //Logger.log(parentID);
  //Logger.log(matrices);
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
  var cursor = DocumentApp.getActiveDocument().getCursor();
  if (cursor){
  var valiId = link.split("/vali/")[1].split('/')[0];
  var template = HtmlService.createTemplateFromFile('code/valiDialog');
  template.vali = getValiValue(valiId);
  template.link = link;
  var page = template.evaluate();
  page.setHeight(550);
  
  var dialog = DocumentApp.getUi().showModalDialog(page, 'Import Vali');
  }else {
    DocumentApp.getUi().alert("Could not find current position. \r\n Please click on the text where you want to add the requirement and make sure you don't have a text selected.");
    return;
  }
}


function customizeVali(link){

}

function insertValiWithParams(link, valiJSON , field, displayUnit, decimalPlaces){
  var cursor = DocumentApp.getActiveDocument().getCursor();
  if (cursor){
  //Logger.log("JSON vali");
  //Logger.log(displayUnit);
  var vali = JSON.parse(valiJSON);
  
  //Logger.log(vali);
  //Logger.log(vali[field]);
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

  var insertedLink = link;
  insertedLink += "?valiField=" + field + " displayUnit=" + (displayUnit ? "true" : "false"); 
  insertedLink += " nbDecimals=" + decimalPlaces;
  
  delete attributes.LINK_URL;
  
 
  newText2.setLinkUrl(insertedLink);
  newText2.setAttributes(attributes); 
  
  highlight = PropertiesService.getDocumentProperties().getProperty('highlightVali');
  //Logger.log('Highlight is: '+highlight);
  if(highlight==="true"){
    //Logger.log('Highlight should be true and it is: '+highlight);
    newText2.setBackgroundColor('#fff9bb');
    newText2.setItalic(true)
  }
  } else {
    DocumentApp.getUi().alert("Could not find current position. \r\n Please click on the text where you want to add the requirement and make sure you don't have a text selected.");
    return;
  }
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

function valisHighlightChange(highlightVali){
}

