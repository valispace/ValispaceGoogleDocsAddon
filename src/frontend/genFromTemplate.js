function saveConvertHtmlDrive(htmlBlob){
  console.log(htmlBlob)
  var encoded = Utilities.base64Encode(htmlBlob);
  var byteDataArray = Utilities.base64Decode(encoded);

  var newFileId = Drive.Files.insert({title: 'Testing'}, Utilities.newBlob(byteDataArray), {convert: true}).id;
  return newFileId;
}

function getGoogleDocumentAsHTML(){
  var id = DocumentApp.getActiveDocument().getId() ;
  var forDriveScope = DriveApp.getStorageUsed(); //needed to get Drive Scope requested
  var url = "https://docs.google.com/feeds/download/documents/export/Export?id="+id+"&exportFormat=html";
  var param = {
    method      : "get",
    headers     : {"Authorization": "Bearer " + ScriptApp.getOAuthToken()},
    muteHttpExceptions:true,
  };
  var html = UrlFetchApp.fetch(url,param).getContentText();
  return html;
}

