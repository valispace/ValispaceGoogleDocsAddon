// For Documenting functions:
/**
 * [someFunction description (ends with period)]
 * @param  {[type]} arg1 - [description]
 * @param  {[type]} arg2 - [description]
 * @return {[type]}      [description]
 */

// ****************************************************************************************
// Valispace API connection
// ****************************************************************************************

/**
 * Try to connect to Valispace with the given username and password.
 * @param  {string} deployment_url - Complete URL for the selected deployment (e.g.: https://staging.valispace.com) without the closing "/"
 * @param  {string} username - username used for connecting to valispace
 * @param  {string} passwd - password used for connecting to valispace
 * @return
 */
function valispaceAskToken(deployment_url, username, passwd){
  //  var dialog = DocumentApp.getUi()

  deployment = deployment_url

  PropertiesService.getUserProperties().setProperty('deployment_url', deployment);

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
    //Logger.log("Connected");

  } else {
    PropertiesService.getUserProperties().setProperty('connectionStatus', 'false');
    PropertiesService.getUserProperties().setProperty('connectionAttemptDone', 'true');
    throw new Error(`Login Error`)
    //TODO: This dialog fails to show
  }
  return responseData
}



/**
 * Check if there is a valid connection to Valispace and tries to connect if not connected and credentials are stored on User Properties.
 * @return {boolean}      Returns True/False if Connection exist
 */
//---------------------------------------------------------------------------------------------------------------------------------------------------
function checkValispaceConnexion(){
  try{
    var response;
    var responseCode;
    try{
      response = getAuthenticatedValispaceUrl('project');
      responseCode = response.getResponseCode() ;
    } catch(e){
      response = e;
      responseCode = "unkown";
    }

    if( responseCode === 200){
      // Connected
      return true;
    } else if (responseCode === 401) {
      // access_token is no longer valid, request a new one
      var username = PropertiesService.getUserProperties().getProperty('valispaceLogin');
      var pwd = PropertiesService.getUserProperties().getProperty('valispacePwd');

      // If Uername and Password properties are not empty, try to reconnect
      if ((username.length > 0) && (pwd.length > 0)){
        valispaceAskToken(username, pwd);
        response = getAuthenticatedValispaceUrl('project');
        responseCode = response.getResponseCode();
        return  responseCode === 200
      }
      return false;
    }
  } catch (e) {
    return false;
  }
  return false;
}

/**
 * UrlFetchApp with the authentication options.
 * @param  {string} subUrl - Base URL for the selected deployment (e.g.: https://staging.valispace.com)
 * @param  {[type]} opt_options - 
 * @return {string}      Returns the Server response to the given request.
 */
//
function getAuthenticatedValispaceUrl(subUrl, opt_options){
  var deployment = PropertiesService.getUserProperties().getProperty('deployment_url');
  var completeUrl = deployment + '/rest/' + subUrl;
  var fetchOptions = opt_options || {};
  if (!fetchOptions.headers) {
    fetchOptions.headers = {};
  }
  fetchOptions.headers.Authorization = 'Bearer ' + PropertiesService.getUserProperties().getProperty('access_token');
  return  UrlFetchApp.fetch(completeUrl, fetchOptions);
}

function deleteToken(){
  try{
    PropertiesService.getUserProperties().getProperty('access_token');
    return true;
  } catch(e){
    return false;
  }
  
}
