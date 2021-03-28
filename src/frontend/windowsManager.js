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

function openSearchRequirementDialog() {
  // Open New Window for Requirement Insertion
  var template = HtmlService.createTemplateFromFile('frontend/searchRequirementDialog');
  var page = template.evaluate();
  var dialog = DocumentApp.getUi().showModalDialog(page, 'Search Requirement');

}

function openTestPage() {
  var template = HtmlService.createTemplateFromFile('frontend/TestPage');
  var page = template.evaluate();
  var dialog = DocumentApp.getUi().showModalDialog(page, 'Test Page');
} // TODO to be removed



// TODO - How can I make the google.script.run to call a object function? It would replace functions below.
function get_workspaces() {
  var Workspaces = WorkspacesCache.get()
  return Workspaces
}
function get_projects(workspaceID) {
  var Projects = ProjectsCache.get(workspaceID)
  return Projects
}

// TODO: Remove those if I cannot load previous workspace and project automatically
function get_previous_workspace() {
  return PropertiesService.getUserProperties().getProperty('selectedWorkspace')
}
function get_previous_project() {
  return PropertiesService.getUserProperties().getProperty('selectedProject')
}

function set_workspace(workspaceID) {
  PropertiesService.getUserProperties().setProperty('selectedWorkspace', workspaceID);
}

function set_project(projectID) {
  PropertiesService.getUserProperties().setProperty('selectedProject', projectID);
}


function build_requirements_tree(projectId) {
  Logger.log('Set Project id' + projectId)
  PropertiesService.getUserProperties().setProperty('projectID', projectId)
  Inserter.load_inserted()
  RequirementsTree.build()

  Logger.log(Inserter.inserted_elements)
}

function update_all_values(projectId) {
  RequirementsTree.update_all()
}

// TODO: Rename to Search and Insert
function insert_req_value(fieldName, searchFieldValue, fieldValue) {
  Logger.log(`Hello World: ${fieldName}, ${searchFieldValue}, ${fieldValue}`)
  //TODO: This doesn't stay in memory needs reload, trouble
  RequirementsTree.build()

  Logger.log(Object.keys(RequirementsTree.nodes_list))
  var req_id = RequirementsTree.search(fieldName, searchFieldValue)
  Logger.log(`Object to be Inserted - ID:  ${req_id}`)
  RequirementsTree.insert_value(req_id, fieldValue.toLowerCase())
}

// TODO: Rename to Insert
function direct_insert(reqId, fieldValue) {
  Logger.log(`Object to be Inserted - ID:  ${reqId} and Property: ${fieldValue} `)
  //TODO: This doesn't stay in memory needs reload, trouble
  RequirementsTree.build()
  RequirementsTree.insert_value(reqId, fieldValue.toLowerCase())
}