function openOptionDialog() { 
  var template = HtmlService.createTemplateFromFile('code/optionsDialog');

  template.highlightOption = "";

  
  if (PropertiesService.getDocumentProperties().getProperty('highlightVali') == "true"){
    template.highlightOption = "checked";
  } 
  else if (PropertiesService.getDocumentProperties().getProperty('highlightVali') == "false"){
    template.highlightOption = "";
  }
  
  var page = template.evaluate();
    
  
  page.setTitle('Options');
  page.setHeight(200);
  
  var dialog = DocumentApp.getUi().showModalDialog(page, 'Options');
}

function createNewTemplate(){
  var template2 = HtmlService.createTemplateFromFile('code/createNewTemplate');
  var page2 = template2.evaluate();
  page2.setTitle('Create New Template');
  page2.setHeight(200);
  var dialog = DocumentApp.getUi().showModalDialog(page2, 'Create New Template');
}


function changeReqTableTemplate(ReqTableID){
  try{
    PropertiesService.getDocumentProperties().setProperty('ReqTableID', ReqTableID);
//    var templatedoc = DocumentApp.openById(ReqTableID);
  } catch (error) {
    DocumentApp.getUi().alert("Could not find the document. Confirm it was not deleted and that anyone have read access with the link.");
    //Logger.log("Document not accessible", ReqTableID)
  } 
}

function resetReqTableTemplate(){
  var ReqTableID_original = '1bDQClCWVcvzPARYl5ohGvBgZlQ519NGGCStqizzK-bU';
  PropertiesService.getDocumentProperties().setProperty('ReqTableID', ReqTableID_original);
}

function changeOptions(highlightVali){
  previousSetting = PropertiesService.getDocumentProperties().getProperty('highlightVali'); 
  //Logger.log('Previous Settings '+previousSetting)
  if (previousSetting != highlightVali){
    PropertiesService.getDocumentProperties().setProperty('highlightVali', highlightVali);
  };
  //Logger.log('new Settings '+PropertiesService.getDocumentProperties().getProperty('highlightVali'))
  
  
  //google.script.run.valisHighlightChange(highlightVali);
}


function clearUserProperties(){
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteAllProperties();
  console.log("cleared user properties");
} 
function clearDocumentProperties(){
  var documentProperties = PropertiesService.getDocumentProperties();
  documentProperties.deleteAllProperties();
  console.log("cleared user properties");
} 
