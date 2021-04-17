function openOptionDialog() { 
  var template = HtmlService.createTemplateFromFile('frontend/optionsDialog');

  template.highlightOption = "";
  
  if (PropertiesService.getDocumentProperties().getProperty('highlightVali') == "true"){
    template.highlightOption = "checked";
  } 
  else if (PropertiesService.getDocumentProperties().getProperty('highlightVali') == "false"){
    template.highlightOption = "";
  }
  
  var page_options = template.evaluate();
    
  
  page_options.setTitle('Options');
  page_options.setHeight(200);
  
  var dialog = DocumentApp.getUi().showModalDialog(page_options, 'Options');
}


function changeReqTableTemplate(TemplateDocumentId){
  try{
    PropertiesService.getDocumentProperties().setProperty('TemplateDocumentId', TemplateDocumentId);
    Logger.log('Changed template document to ID: ', TemplateDocumentId)
//    var templatedoc = DocumentApp.openById(TemplateDocumentId);
  } catch (error) {
    DocumentApp.getUi().alert("Could not find the document. Confirm it was not deleted and that anyone have read access with the link.");
    //Logger.log("Document not accessible", TemplateDocumentId)
  } 
}

function resetReqTableTemplate(){
  var TemplateDocumentId_original = '1bDQClCWVcvzPARYl5ohGvBgZlQ519NGGCStqizzK-bU';
  PropertiesService.getDocumentProperties().setProperty('TemplateDocumentId', TemplateDocumentId_original);
}

function changeOptions(highlightVali){
  previousSetting = PropertiesService.getDocumentProperties().getProperty('highlightVali'); 
  //Logger.log('Previous Settings '+previousSetting)
  if (previousSetting != highlightVali){
    PropertiesService.getDocumentProperties().setProperty('highlightVali', highlightVali);
  };
  //Logger.log('new Settings '+PropertiesService.getDocumentProperties().getProperty('highlightVali'))
    
  //google.script.run.valisHighlightChange(highlightVali);
}


function clearUserProperties(){
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteAllProperties();
  console.log("cleared user properties");
} 
function clearDocumentProperties(){
  var documentProperties = PropertiesService.getDocumentProperties();
  documentProperties.deleteAllProperties();
  console.log("cleared user properties");
} 

function printCurrentTemplateID(){
  currentTemplateId = PropertiesService.getDocumentProperties().getProperty('TemplateDocumentId')
  Logger.log(currentTemplateId)
}
