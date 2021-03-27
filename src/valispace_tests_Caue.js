function c_temp_test() {
  valispaceAskToken("https://staging.valispace.com", "admin", "vali")
  PropertiesService.getUserProperties().setProperty('deployment_url', 'https://staging.valispace.com');
  PropertiesService.getUserProperties().setProperty('projectID', '24');
  RequirementsTree.build(true);
  html = recursiveFunction(RequirementsTree.root_nodes)
  Logger.log(html)
}

function recursiveFunction(object, html=''){

  //  Insert HTML text
  for (element in object){
    item = object[element]
    html = html.concat('<a>', String(item.data.id), '-', String(item.data.name),'</a>')
    //  If Object.children is not empty
    if (item.children !=null){
      //  recursiveFunction
      html = recursiveFunction(item.children, html)
    } else {
      Logger.log('no child')
    }
    //  Else
    //  end?
  }
  return html
}



function c_connect_temp() {
  valispaceAskToken("https://staging.valispace.com", "admin", "vali")
}

function c_checkValispaceConnexion() {
  Logger.log(checkValispaceConnexion())
}


function c_checkValispaceConnexion2() {
  PropertiesService.getUserProperties().setProperty('deployment_url', 'https://staging.valispace.com')
  Logger.log(checkValispaceConnexion())
}

function seeUserProperties() {
  var scriptProperties = PropertiesService.getUserProperties();
  var data = scriptProperties.getProperties();
  for (var key in data) {
    Logger.log('Key: %s, Value: %s', key, data[key]);
  }
}

function deleteUserProperties(){
  PropertiesService.getUserProperties().deleteAllProperties();
}

function disconnect(){

}