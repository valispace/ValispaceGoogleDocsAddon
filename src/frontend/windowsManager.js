function openSearchRequirementDialog() {
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

function set_project(projectID) {
  PropertiesService.getUserProperties().setProperty('projectID', projectID);
}




// function build_requirements_tree(projectId) {
//   Logger.log('Set Project id' + projectId)
//   PropertiesService.getUserProperties().setProperty('projectID', projectId)
//   Inserter.load_inserted()
//   RequirementsTree.build()

//   Logger.log(Inserter.inserted_elements)
// }

// function update_all_values(projectId) {
//   RequirementsTree.update_all()
// }

// // TODO: Rename to Search and Insert
// function insert_req_value(fieldName, searchFieldValue, fieldValue) {
//   Logger.log(`Hello World: ${fieldName}, ${searchFieldValue}, ${fieldValue}`)
//   //TODO: This doesn't stay in memory needs reload, trouble
//   RequirementsTree.build()

//   Logger.log(Object.keys(RequirementsTree.nodes_list))
//   var req_id = RequirementsTree.search(fieldName, searchFieldValue)
//   Logger.log(`Object to be Inserted - ID:  ${req_id}`)
//   RequirementsTree.insert_value(req_id, fieldValue.toLowerCase())
// }

// // TODO: Rename to Insert
// function direct_insert(reqId, fieldValue) {
//   Logger.log(`Object to be Inserted - ID:  ${reqId} and Property: ${fieldValue} `)
//   //TODO: This doesn't stay in memory needs reload, trouble
//   RequirementsTree.build()
//   RequirementsTree.insert_value(reqId, fieldValue.toLowerCase())
// }
