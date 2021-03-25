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

function build_requirements_tree(projectId){
  Logger.log('Set Project id'+projectId)
  PropertiesService.getUserProperties().setProperty('projectID', projectId)
  Inserter.load_inserted()
  RequirementsTree.build()
  Logger.log(Inserter.inserted_elements)
}

function update_all_values(projectId){
  RequirementsTree.update_all()
}

function insert_req_value(fieldName, searchFieldValue, fieldValue){
  Logger.log(`Hello World: ${fieldName}, ${searchFieldValue}, ${fieldValue}`)
  //TODO: This doesn't stay in memory needs reload, trouble
  RequirementsTree.build()

  Logger.log(Object.keys(RequirementsTree.nodes_list))
  var req_id = RequirementsTree.search(fieldName,searchFieldValue)
  RequirementsTree.insert_value(req_id, fieldValue.toLowerCase())
}