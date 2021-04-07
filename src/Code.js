function showSidebar() {

  if (checkValispaceConnexion()){
    var template = HtmlService.createTemplateFromFile('frontend/sidebarTemplate');
    Logger.log('Already Connected')
  } else {
    var template = HtmlService.createTemplateFromFile('frontend/loginPage');
    Logger.log('No Connection')
  }
  
 
  var page = template.evaluate();
  page.setTitle('Valispace on Google Docs');
 
  DocumentApp.getUi().showSidebar(page);
  
  // var ReqTableID_original = '1bDQClCWVcvzPARYl5ohGvBgZlQ519NGGCStqizzK-bU';
  // if (PropertiesService.getDocumentProperties().getProperty('ReqTableID') === null) {
  //   PropertiesService.getDocumentProperties().setProperty('ReqTableID', ReqTableID_original);
  // };  
  // if (PropertiesService.getDocumentProperties().getProperty('highlightVali') === null) {
  //   PropertiesService.getDocumentProperties().setProperty('highlightVali', false);
  // };
  // if (PropertiesService.getDocumentProperties().getProperty('individualReq') === null) {
  //   PropertiesService.getDocumentProperties().setProperty('individualReq', false);
  // };
  // if (PropertiesService.getDocumentProperties().getProperty('firstRowHeader') === null) {
  //   PropertiesService.getDocumentProperties().setProperty('firstRowHeader', false);
  // };
}

function goToMainPage(){
  // TODO : Remove this if not necessary
  Logger.log('Is it connected?')
  Logger.log(checkValispaceConnexion())
  var template = HtmlService.createTemplateFromFile('frontend/sidebarTemplate');
  var page = template.evaluate();
  page.setTitle('Valispace on Google Docs');
 
  DocumentApp.getUi().showSidebar(page);
}

function logOutToLogin(){
  // TODO : Remove this if not necessary
  Logger.log('Is it connected?')
  Logger.log(checkValispaceConnexion())
  var template = HtmlService.createTemplateFromFile('frontend/loginPage');
  var page = template.evaluate();
  page.setTitle('Valispace on Google Docs');
 
  DocumentApp.getUi().showSidebar(page);
}

function onInstall(e){
  onOpen(e);
}

function onOpen(e) {

  // TODO: Maybe we can start downloading data here to speed up
  
  DocumentApp.getUi().createAddonMenu()
      .addItem('Show sidebar', 'showSidebar')
      .addToUi();
}

