
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
        // Requirements Update
        // The Vali ID is at the last position of the link
        if(curUrl.url.indexOf(deployment+'/specifications/requirements/') === 0){
          try{
            var splitted = curUrl.url.split("/requirements/")[1].split('?');
            //Logger.log(splitted);
            var reqId = splitted[0].split("/")[0];
            //Logger.log("Requirement ID: ", reqId);
            var params = splitted[1].split(" ")
            var field = params[0].split("=")[1].replace(/#/g,"");
            
            var ReqJson = getAuthenticatedValispaceUrl("requirements/"+reqId);

            value = JSON.parse(ReqJson)[field]
            
            var newTextToInsert = "";
            if (field == "text" || field == "comment"){
              newTextToInsert += interpretReqTextSimple(value);
            } else{
              newTextToInsert += value;
            };
            
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
            
            txtLength = txtLength + newTextToInsert.length - 1 - (curUrl.endOffsetInclusive - curUrl.startOffset);
            ch = ch + newTextToInsert.length - 1 - (curUrl.endOffsetInclusive - curUrl.startOffset);
            
           //var responseComponentReq = getAuthenticatedValispaceUrl("requirements/component-requirements");
           //compReqs = JSON.parse(responseComponentReq.getContentText());
          }catch (e){
          }
          
          
        }
        // Valis Update
        // Test if this is a valid URL.
        if(curUrl.url.indexOf(deployment+'/components/') === 0){
          try{
            var splitted = curUrl.url.split("/vali/")[1].split('?');
            //Logger.log(splitted);
            var valiId = splitted[0];
            //Logger.log(valiId);
            
            var params = splitted[1].split(" ");
            //Logger.log(params);
            var field = params[0].split("=")[1];
            //Logger.log(field);
            var displayUnit = params[1].split("=")[1];
            //Logger.log(displayUnit);
            var nbDecimals;
            try{
              nbDecimals = parseInt(params[2].split("=")[1]);
            } catch (e) { // If decimal is not defined.
              nbDecimals = 2;
              curUrl.url += " nbDecimals=2"
            }
            //Logger.log("nbDecimals");
            //Logger.log(nbDecimals)
            //Logger.log(curUrl.attributes);
            
            
            
            
            var vali = getValiValue(valiId, allValis);
            //Logger.log(vali);
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
            //Logger.log(newTextToInsert);
            
            
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
            
            if (PropertiesService.getDocumentProperties().getProperty('highlightVali') == "true"){
              textObj.setBackgroundColor('#fff9bb');
              textObj.setItalic(true);
            } else {
              textObj.setItalic(false);
              textObj.setBackgroundColor(null);
            }

            
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

function testing(){
  url = "https://demo.valispace.com/specifications/requirements/371/components?field=#text#"
  var splitted = url.split("/requirements/")[1].split('?');
  //Logger.log(splitted);
  var reqId = splitted[0].split("/")[0];
  //Logger.log("Requirement ID: ", reqId);
  var params = splitted[1].split(" ")
  var field = params[0].split("=")[1].replace(/#/g,"");
  
  var ReqJson = getAuthenticatedValispaceUrl("requirements/"+reqId);
  JSON.parse(ReqJson)[field]
}