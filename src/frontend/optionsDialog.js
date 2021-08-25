function openOptionDialog() { 
  var template = HtmlService.createTemplateFromFile('frontend/optionsDialog');
  var page_options = template.evaluate();
  page_options.setTitle('Options');
  page_options.setHeight(200);
  var dialog = DocumentApp.getUi().showModalDialog(page_options, 'Options');
}

function changeReqTableTemplate(TemplateDocumentId){
  try{
    PropertiesService.getDocumentProperties().setProperty('TemplateDocumentId', TemplateDocumentId);
  } catch (error) {
    DocumentApp.getUi().alert("Could not find the document. Confirm it was not deleted and that anyone have read access with the link.");
  } 
}

function resetReqTableTemplate(){
  PropertiesService.getDocumentProperties().setProperty('TemplateDocumentId', TemplateDocumentId_original);
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
