// Connect to Valispace
function connectValispace() {
  // Open New Window for Connection
  var template = HtmlService.createTemplateFromFile('frontend/connectionDialog');
  var page = template.evaluate();
  // PropertiesService.getUserProperties().setProperty('connectionAttemptDone', 'false');

  var dialog = DocumentApp.getUi().showModalDialog(page, 'Connect to Valispace');

  while (PropertiesService.getUserProperties().getProperty('connectionAttemptDone') === 'false') {
  }
  return (PropertiesService.getUserProperties().getProperty('connectionStatus') === 'true');

}

function openSearchRequirementDialog(){
    // Open New Window for Requirement Insertion
    var template = HtmlService.createTemplateFromFile('frontend/searchRequirementDialog');
    var page = template.evaluate();
    var dialog = DocumentApp.getUi().showModalDialog(page, 'Search Requirement');

}

// TODO - How can I make the google.script.run to call a object function? It would replace functions below.
function get_workspaces() {
  var Workspaces = WorkspacesCache.get()
  return Workspaces
}
function get_projects(workspaceID) {
  var Projects = ProjectsCache.get(workspaceID)
  return Projects
}

function update_requirements_tree(projectId){
  Logger.log('Set Project id'+projectId)
  PropertiesService.getUserProperties().setProperty('projectID', projectId)
  RequirementsTree.update()
}

function insert_req_value(fieldName, searchFieldValue, fieldValue){
  Logger.log(`Hello World: ${fieldName}, ${searchFieldValue}, ${fieldValue}`)
  RequirementsTree.update()
  
  Logger.log(Object.keys(RequirementsTree.nodes_list))
  Logger.log(searchFieldValue)
  Logger.log(PropertiesService.getUserProperties().getProperty('projectID'))
  var req_id = RequirementsTree.search(fieldName,searchFieldValue)
  Logger.log(req_id)
  Logger.log(fieldValue.toLowerCase())
  RequirementsTree.insert_value(req_id, fieldValue.toLowerCase())
}