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
    var body = DocumentApp.openById(TemplateDocumentId_requirements).getBody()
    table = body.getTables()[0]
  } catch (error) {
    DocumentApp.getUi().alert("Could not find the document. Confirm it was not deleted and that anyone have read access with the link. Reverting to default template.");
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

function redirectToTemplate(module) {
  PropertiesService.getDocumentProperties().setProperty('TemplateDocumentId_' + module, TemplateDocumentId_default[module]);
  var url = DocumentApp.openById(TemplateDocumentId_default[module]).getUrl();


  // Try to get the table to see if the user has access (permission) to it.
  var url = DocumentApp.openById(TemplateDocumentId_default[module]).getUrl();

  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  var cursor = doc.getCursor();
  if (cursor) {
    var element = cursor.getElement();
    // Get the first Body Section parent of the element
    while (element.getParent().getType() != DocumentApp.ElementType.BODY_SECTION) {
      element = element.getParent();
    }
    var index = body.getChildIndex(element);
  }
  else {
    DocumentApp.getUi().alert("Could not find current position. Please click on the text where you want to add the requirement.");
    return;
  }
  //var indexCursor = previousTableIndex(body, cursor);
  var paragraph = body.insertParagraph(index, "To edit the " + module + " template you need to create a copy of this document : ");
  var newIndex = index + 1;
  var link_paragraph = body.insertParagraph(newIndex, url);
  console.log(url.length);
  link_paragraph.editAsText().setLinkUrl(0, url.length - 1, url);

}

