function openOptionDialog() {
  var template = HtmlService.createTemplateFromFile('frontend/optionsDialog');
  var page_options = template.evaluate();
  page_options.setTitle('Options');
  page_options.setHeight(200);
  var dialog = DocumentApp.getUi().showModalDialog(page_options, 'Options');
}

function changeTableTemplate(module, TemplateDocumentId_requirements){
  try{
    PropertiesService.getDocumentProperties().setProperty('TemplateDocumentId_' + module, TemplateDocumentId_requirements);

    // Try to get the table to see if the user has access (permission) to it.
    var body = DocumentApp.openById(documentId).getBody()
    table = body.getTables()[0]
  } catch (error) {
    DocumentApp.getUi().alert("Could not find the document. Confirm it was not deleted and that anyone have read access with the link. Reverting to default tempalte.");
    resetTableTemplate(module) // Revert back to the default template.
  }
}

function resetTableTemplate(module){
  PropertiesService.getDocumentProperties().setProperty('TemplateDocumentId_' + module, TemplateDocumentId_default[module]);
}


function clearUserProperties(){
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteAllProperties();
}
function clearDocumentProperties(){
  var documentProperties = PropertiesService.getDocumentProperties();
  documentProperties.deleteAllProperties();
}

// function printCurrentTemplateID(){
//   currentTemplateId = PropertiesService.getDocumentProperties().getProperty('TemplateDocumentId_requirements')
// }
