// ****************************************************************************************
// Valispace API stuff
// ****************************************************************************************


// Connection avec valispace, on stocke le access_token dans les paramètres utilisateurs de ce script
function connectValispace(){
  
  // On ouvre une fenêtre pour la connexion
  
  var coucou = false;
  var connected = false;
  
  var template = HtmlService.createTemplateFromFile('connexionDialog');
  var page = template.evaluate();
  PropertiesService.getUserProperties().setProperty('connexionAttemptDone', 'false');
  
  var dialog = DocumentApp.getUi().showModalDialog(page, 'Connect to Valispace');
  
  while(PropertiesService.getUserProperties().getProperty('connexionAttemptDone') === 'false'){
     
  }
  
  return (PropertiesService.getUserProperties().getProperty('connexionStatus') === 'true');
  
  
  
}


function valispaceAskToken(username, passwd){
  Logger.log("This is the connect");
  Logger.log(username);
  Logger.log(passwd); 
  var tokenUrl = 'https://demo.valispace.com/o/token/'
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
    PropertiesService.getUserProperties().setProperty('connexionStatus', 'true');
    PropertiesService.getUserProperties().setProperty('connexionAttemptDone', 'true');
    PropertiesService.getUserProperties().setProperty('valispaceLogin', username); 
    PropertiesService.getUserProperties().setProperty('valispacePwd', passwd);
    Logger.log("Connected, access token");
    Logger.log(accessToken);
  } else {
    PropertiesService.getUserProperties().setProperty('connexionStatus', 'false');
    PropertiesService.getUserProperties().setProperty('connexionAttemptDone', 'true');
    throw Error('No access token received: ' + response.getContentText());
  }
  
  
}


// TODO tester en vrai
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
      // On est bien connecté
      Logger.log("On est bien connecté");
      return true;
    } else if (responseCode === 401) {
      // Notre access_token n'est plus valable, on en demande un nouveau
      Logger.log("Oh no return code");
      var username = PropertiesService.getUserProperties().getProperty('valispaceLogin');
      var pwd = PropertiesService.getUserProperties().getProperty('valispacePwd');
      Logger.log("Coucou le username");
      Logger.log(username); 
      Logger.log("Coucou le pwd"); 
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
  //var response = getAuthenticatedValispaceUrl('project');
  
  return([{name:'Constants', id:3}, {name:'Satellite__ValiSat', id:24}, {name:'Simulator', id:25},{name:'Rocket__SaturnV', id:2},{name:'Test', id:28}, {name:'N3SS', id:21}]);
}




// Fait un UrlFetchApp de l'url valispace avec les options d'authentification
function getAuthenticatedValispaceUrl(subUrl, opt_options){
  var completeUrl = 'https://demo.valispace.com/rest/' + subUrl;
  var fetchOptions = opt_options || {};
  if (!fetchOptions.headers) {
    fetchOptions.headers = {};
  }
  fetchOptions.headers.Authorization = 'Bearer ' + PropertiesService.getUserProperties().getProperty('access_token');
  Logger.log("Getting URL");
  Logger.log(completeUrl);
  return  UrlFetchApp.fetch(completeUrl, fetchOptions);
}
