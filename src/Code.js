var releaseVersion = "0.1"
var TemplateDocumentId_original = '1ta4E39lwjjB8sVk2UPRBPZiy-rH9P_cmhCpLyyIQbXE';
var defaultDeployment = 'https://demo.valispace.com';

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
  if (PropertiesService.getUserProperties().getProperty('savedDeployment') === null) {
    PropertiesService.getUserProperties().setProperty('savedDeployment', defaultDeployment);
  };
  if (PropertiesService.getUserProperties().getProperty('savedUsername') === null) {
    PropertiesService.getUserProperties().setProperty('savedUsername', '');
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
  DocumentApp.getUi().showSidebar(page);
}



function goToMainPage() {
  // TODO : Remove this if not necessary
  var template = HtmlService.createTemplateFromFile('frontend/sidebarTemplate');
  var page = template.evaluate();
  page.setTitle('Valispace on Google Docs');

  DocumentApp.getUi().showSidebar(page);
}

function onInstall(e) {
  onOpen(e);
}


function getSavedDeployment(){
  return PropertiesService.getUserProperties().getProperty('savedDeployment')
}
function setSavedDeployment(deployment){
  PropertiesService.getUserProperties().setProperty('savedDeployment', deployment)
}
function getSavedUsername(){
  return PropertiesService.getUserProperties().getProperty('savedUsername')
}
function setSavedUsername(savedusername){
  PropertiesService.getUserProperties().setProperty('savedUsername', savedusername)
}

function getCurrentVersion(){
  return releaseVersion
}