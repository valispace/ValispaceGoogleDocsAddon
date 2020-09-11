function showSidebar() {
  var template = HtmlService.createTemplateFromFile('code/sidebarTemplate');
  var page = template.evaluate();
  page.setTitle('Valispace on Google Docs');
 
  DocumentApp.getUi().showSidebar(page);
  
  var ReqTableID_original = '1bDQClCWVcvzPARYl5ohGvBgZlQ519NGGCStqizzK-bU';
  if (PropertiesService.getDocumentProperties().getProperty('ReqTableID') === null) {
    PropertiesService.getDocumentProperties().setProperty('ReqTableID', ReqTableID_original);
  };  
  if (PropertiesService.getDocumentProperties().getProperty('highlightVali') === null) {
    PropertiesService.getDocumentProperties().setProperty('highlightVali', false);
  };
    

}


function onInstall(e){
  onOpen(e);
}

function onOpen(e) {
  DocumentApp.getUi().createAddonMenu()
      .addItem('Show sidebar', 'showSidebar')
      .addToUi();
}

