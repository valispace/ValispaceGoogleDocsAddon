var TemplateDocumentId_original = '1bDQClCWVcvzPARYl5ohGvBgZlQ519NGGCStqizzK-bU';

function onOpen(e) {
  DocumentApp.getUi().createAddonMenu()
  .addItem('Show sidebar', 'showSidebar')
  .addToUi();
}

function showSidebar() {
  // TODO: Maybe we can start downloading data here to speed up
  if (PropertiesService.getDocumentProperties().getProperty('TemplateDocumentId') === null) {
    PropertiesService.getDocumentProperties().setProperty('TemplateDocumentId', TemplateDocumentId_original);
  };
  // Check if Connection is still valid and skip login page if valid.
  if (checkValispaceConnexion()) {
    var template = HtmlService.createTemplateFromFile('frontend/sidebarTemplate');
  } else {
    var template = HtmlService.createTemplateFromFile('frontend/loginPage');
  }

  var page = template.evaluate();
  page.setTitle('Valispace on Google Docs');

  DocumentApp.getUi().showSidebar(page);

}

function disconnect() {
  response = PropertiesService.getUserProperties().deleteProperty('access_token');
  var template = HtmlService.createTemplateFromFile('frontend/loginPage');
  var page = template.evaluate();
  page.setTitle('Valispace on Google Docs');
  Logger.log('Should go to Login Page')
  DocumentApp.getUi().showSidebar(page);
}

function goToMainPage() {
  // TODO : Remove this if not necessary
  Logger.log('Is it connected?')
  Logger.log(checkValispaceConnexion())
  var template = HtmlService.createTemplateFromFile('frontend/sidebarTemplate');
  var page = template.evaluate();
  page.setTitle('Valispace on Google Docs');

  DocumentApp.getUi().showSidebar(page);
}

function onInstall(e) {
  onOpen(e);
}

