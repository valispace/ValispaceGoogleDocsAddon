function showSidebar() {
  var template = HtmlService.createTemplateFromFile('code/sidebarTemplate');
  var page = template.evaluate();
  page.setTitle('Valispace on Google Docs');
  
  DocumentApp.getUi().showSidebar(page);
  
}


function onInstall(e){
  onOpen(e);
}

function onOpen(e) {
  DocumentApp.getUi().createAddonMenu()
      .addItem('Show sidebar', 'showSidebar')
      .addToUi();
}