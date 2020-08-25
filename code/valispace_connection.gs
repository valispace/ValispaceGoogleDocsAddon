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

function showErrorTest(message){

}


function valispaceAskToken(deployment_name, username, passwd){
  var dialog = DocumentApp.getUi()
  
  deployment = deployment_name
  //Logger.log("Connected to: "+deployment)
  PropertiesService.getUserProperties().setProperty('deployment', deployment);  

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
    //Logger.log("Connected");

  } else {
    PropertiesService.getUserProperties().setProperty('connectionStatus', 'false');
    PropertiesService.getUserProperties().setProperty('connectionAttemptDone', 'true');
    dialog.alert('Wrong Username or Password', 'You inserted a wrong username or password, please try again', dialog.ButtonSet.OK)
    //throw Error('No access token received: ' + response.getContentText());
  }  
  
}



function checkValispaceConnexion(){
  //Logger.log("Testing valispace connexion");
  
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
      //Logger.log("User Connected");
      return true;
    } else if (responseCode === 401) {
      // access_token is no longer valid, request a new one
      //Logger.log("No return code");
      var username = PropertiesService.getUserProperties().getProperty('valispaceLogin');
      var pwd = PropertiesService.getUserProperties().getProperty('valispacePwd');
      //Logger.log("username");
      //Logger.log(username); 
      //Logger.log("pwd"); 
      //Logger.log(pwd);
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


function get_projects(workspaceID){
  //Logger.log("Getting projects");
  //var allProjects = JSON.parse(getAuthenticatedValispaceUrl('project').getContentText());
  var allProjects = JSON.parse(getAuthenticatedValispaceUrl('project/?workspace='+workspaceID).getContentText());
  projectList = "[{\"name\":\"" + allProjects[0].name + "\",\"id\":" + allProjects[0].id +"}"
  for(i=1; i < allProjects.length; i++){
    projectList = projectList + ",{\"name\":\"" + allProjects[i].name + "\",\"id\":" + allProjects[i].id +"}"
  }
  projectList = projectList + "]"
  return(JSON.parse(projectList));
  
}

function get_workspaces(){
  //Logger.log("Getting Workspaces");
  var allWorkspaces = JSON.parse(getAuthenticatedValispaceUrl('workspace').getContentText());
  workspaceList = "[{\"name\":\"" + allWorkspaces[0].name + "\",\"id\":" + allWorkspaces[0].id +"}"
  for(i=1; i < allWorkspaces.length; i++){
    workspaceList = workspaceList + ",{\"name\":\"" + allWorkspaces[i].name + "\",\"id\":" + allWorkspaces[i].id +"}"
  }
  workspaceList = workspaceList + "]"
  return(JSON.parse(workspaceList));
}


// UrlFetchApp with the authentication options
function getAuthenticatedValispaceUrl(subUrl, opt_options){
  var deployment = PropertiesService.getUserProperties().getProperty('deployment');
  var completeUrl = deployment + '/rest/' + subUrl;
  var fetchOptions = opt_options || {};
  if (!fetchOptions.headers) {
    fetchOptions.headers = {};
  }
  fetchOptions.headers.Authorization = 'Bearer ' + PropertiesService.getUserProperties().getProperty('access_token');
  //Logger.log("Getting URL");
  //Logger.log(completeUrl);
    return  UrlFetchApp.fetch(completeUrl, fetchOptions);
  }
