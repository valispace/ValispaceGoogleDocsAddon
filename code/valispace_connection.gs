// ****************************************************************************************
// Valispace API connection
// ****************************************************************************************


// Connect to Valispace
function connectValispace(){
  
  // Open New Window for Connection
  
  var template = HtmlService.createTemplateFromFile('code/connectionDialog');
  var page = template.evaluate();
  PropertiesService.getUserProperties().setProperty('connectionAttemptDone', 'false');
  
  var dialog = DocumentApp.getUi().showModalDialog(page, 'Connect to Valispace');
  
  while(PropertiesService.getUserProperties().getProperty('connectionAttemptDone') === 'false'){
     
  }
  
  return (PropertiesService.getUserProperties().getProperty('connectionStatus') === 'true');  
  
}


function valispaceAskToken(deployment_name, username, passwd){
  Logger.log("This is the connect");
  deployment = "https://"+deployment_name+".valispace.com"
  Logger.log(deployment)
  PropertiesService.getScriptProperties().setProperty('deployment', deployment);
  Logger.log(username);
  Logger.log(passwd); 
  var tokenUrl = deployment + '/o/token/'
  var payload = {
    grant_type: 'password',
    client_id: 'ValispaceREST',
    username: username,
    password: passwd
  };
  var options = {muteHttpExceptions: true, method: 'POST', payload: payload};
  var response = UrlFetchApp.fetch(tokenUrl, options);
  var responseData = JSON.parse(response.getContentText());
  if (responseData && responseData.access_token) {
    var accessToken = responseData.access_token;
    PropertiesService.getUserProperties().setProperty('access_token',accessToken);
    PropertiesService.getUserProperties().setProperty('connectionStatus', 'true');
    PropertiesService.getUserProperties().setProperty('connectionAttemptDone', 'true');
    PropertiesService.getUserProperties().setProperty('valispaceLogin', username); 
    PropertiesService.getUserProperties().setProperty('valispacePwd', passwd);
    Logger.log("Connected, access token");
    Logger.log(accessToken);
  } else {
    PropertiesService.getUserProperties().setProperty('connectionStatus', 'false');
    PropertiesService.getUserProperties().setProperty('connectionAttemptDone', 'true');
    throw Error('No access token received: ' + response.getContentText());
  }
  
  
}



function checkValispaceConnexion(){
  Logger.log("Testing valispace connexion");
 
  
  try{
    var response;
    var responseCode;
    try{
      response = getAuthenticatedValispaceUrl('project');
      responseCode = reponse.getResponseCode() ;
    } catch(e){
      response = '';
      responseCode = 200;
    }
      
    if( responseCode === 200){
      // Connected
      Logger.log("User Connected");
      return true;
    } else if (responseCode === 401) {
      // access_token is no longer valid, request a new one
      Logger.log("No return code");
      var username = PropertiesService.getUserProperties().getProperty('valispaceLogin');
      var pwd = PropertiesService.getUserProperties().getProperty('valispacePwd');
      Logger.log("username");
      Logger.log(username); 
      Logger.log("pwd"); 
      Logger.log(pwd);
      if ((username.length > 0) && (pwd.length > 0)){
         valispaceAskToken(username, pwd);
         response = getAuthenticatedValispaceUrl('project');
         responseCode = reponse.getResponseCode();
         return  responseCode === 200
      }
      return false;
    }
  } catch (e) {
    return false;
  }
  return false;
  
  
   
  
}

function promptPassword() {
 
}


function get_projects(){
  Logger.log("Getting projects");
  var allProjects = JSON.parse(getAuthenticatedValispaceUrl('project').getContentText());
  projectList = "[{\"name\":\"" + allProjects[0].name + "\",\"id\":" + allProjects[0].id +"}"
  for(i=1; i < allProjects.length; i++){
    projectList = projectList + ",{\"name\":\"" + allProjects[i].name + "\",\"id\":" + allProjects[i].id +"}"
  }
  projectList = projectList + "]"
  return(JSON.parse(projectList));
  
}




// UrlFetchApp with the authentication options
function getAuthenticatedValispaceUrl(subUrl, opt_options){
  var deployment = PropertiesService.getScriptProperties().getProperty('deployment');
  var completeUrl = deployment + '/rest/' + subUrl;
  var fetchOptions = opt_options || {};
  if (!fetchOptions.headers) {
    fetchOptions.headers = {};
  }
  fetchOptions.headers.Authorization = 'Bearer ' + PropertiesService.getUserProperties().getProperty('access_token');
  Logger.log("Getting URL");
  Logger.log(completeUrl);
    return  UrlFetchApp.fetch(completeUrl, fetchOptions);
  }
