 /**
   * @OnlyCurrentDoc
   */


var releaseVersion = "1.2.0"
var TemplateDocumentId_requirements_original = '1ta4E39lwjjB8sVk2UPRBPZiy-rH9P_cmhCpLyyIQbXE';
var TemplateDocumentId_files_original = '1Io4O2yciHZw0Sqw3tSB0SfKp2zHKxKnawN1B1AV6EJY';
var defaultDeployment = 'https://demo.valispace.com';
var individual_tables = false;

function onInstall(e) {
  onOpen(e);
}

function onOpen(e) {
  DocumentApp.getUi().createAddonMenu()
  .addItem('Show Sidebar', 'showSidebar')
  .addToUi();
}


function showSidebar() {

  if (PropertiesService.getDocumentProperties().getProperty('TemplateDocumentId_requirements') === null) {
    PropertiesService.getDocumentProperties().setProperty('TemplateDocumentId_requirements', TemplateDocumentId_requirements_original);
  };
  if (PropertiesService.getDocumentProperties().getProperty('TemplateDocumentId_files') === null) {
    PropertiesService.getDocumentProperties().setProperty('TemplateDocumentId_files', TemplateDocumentId_files_original);
  };
  if (PropertiesService.getUserProperties().getProperty('savedDeployment') === null) {
    PropertiesService.getUserProperties().setProperty('savedDeployment', defaultDeployment);
  };
  if (PropertiesService.getUserProperties().getProperty('savedUsername') === null) {
    PropertiesService.getUserProperties().setProperty('savedUsername', '');
  };
  if (PropertiesService.getDocumentProperties().getProperty('individual_tables') === true || PropertiesService.getDocumentProperties().getProperty('individual_tables') === null) {
    PropertiesService.getDocumentProperties().setProperty('individual_tables', false);
  }
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

function goToMainPage() {
  var template = HtmlService.createTemplateFromFile('frontend/sidebarTemplate');
  var page = template.evaluate();
  page.setTitle('Valispace on Google Docs');
  DocumentApp.getUi().showSidebar(page);
}


function disconnect() {
  response = PropertiesService.getUserProperties().deleteProperty('access_token');
  var template = HtmlService.createTemplateFromFile('frontend/loginPage');
  var page = template.evaluate();
  page.setTitle('Valispace on Google Docs');
  DocumentApp.getUi().showSidebar(page);
}

