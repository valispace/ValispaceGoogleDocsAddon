function c_temp_test(){
  connect_temp();
  PropertiesService.getUserProperties().setProperty('deployment_url', 'https://staging.valispace.com');
  PropertiesService.getUserProperties().setProperty('projectID', '51');
  // var Workspaces = WorkspacesCache.get()
  // var Projects = ProjectsCache.get(3)
  // Logger.log(Projects)

  RequirementsTree.update();
  Logger.log(RequirementsTree)

}

function c_connect_temp(){
  valispaceAskToken("https://staging.valispace.com", "admin", "vali")
}


function c_checkValispaceConnexion2(){
  PropertiesService.getUserProperties().setProperty('deployment_url', 'https://staging.valispace.com')
  Logger.log(checkValispaceConnexion())
}
