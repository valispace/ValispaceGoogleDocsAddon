function showSidebar() {
  var template = HtmlService.createTemplateFromFile('code/sidebarTemplate');
  var page = template.evaluate();
  page.setTitle('Valispace');
  
  DocumentApp.getUi().showSidebar(page);
  
  // Todo connect if not connected

}


function onInstall(e){
  onOpen(e);
}

function onOpen(e) {
  DocumentApp.getUi().createAddonMenu()
      .addItem('Show sidebar', 'showSidebar')
      .addToUi();
}