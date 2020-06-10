function openOptionDialog() { 
  var template = HtmlService.createTemplateFromFile('code/optionsDialog');
  var page = template.evaluate();
  page.setTitle('Options');
  //page.setHeight(400);
  
  var dialog = DocumentApp.getUi().showModalDialog(page, 'Options');
}
