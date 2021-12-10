function openOptionDialog() { 
  var template = HtmlService.createTemplateFromFile('frontend/optionsDialog');
  var page_options = template.evaluate();
  page_options.setTitle('Options');
  page_options.setHeight(200);
  var dialog = DocumentApp.getUi().showModalDialog(page_options, 'Options');
}

function changeReqTableTemplate(TemplateDocumentId_requirements, module){
  try{
    PropertiesService.getDocumentProperties().setProperty(module + '_TemplateDocumentId_requirements', TemplateDocumentId_requirements);
  } catch (error) {
    DocumentApp.getUi().alert("Could not find the document. Confirm it was not deleted and that anyone have read access with the link.");
  } 
}

function resetReqTableTemplate(module){
  PropertiesService.getDocumentProperties().setProperty(module + '_TemplateDocumentId_requirements', TemplateDocumentId_requirements_original);
}

function clearUserProperties(){
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteAllProperties();
} 
function clearDocumentProperties(){
  var documentProperties = PropertiesService.getDocumentProperties();
  documentProperties.deleteAllProperties();
} 

function printCurrentTemplateID(){
  currentTemplateId = PropertiesService.getDocumentProperties().getProperty('TemplateDocumentId_requirements')
}

function setIndividualTables(setting) {
  PropertiesService.getDocumentProperties().setProperty('individual_tables', setting);
}

function check_individual_tables() {
  // Checking if individual_tables is set to true
  var property = PropertiesService.getDocumentProperties().getProperty('individual_tables')
  // Extra step because Properties are stored as type string, evaluating to boolean
  var checked = (property === 'true')
  return checked
}
