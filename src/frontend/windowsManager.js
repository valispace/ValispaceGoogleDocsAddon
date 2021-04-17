function openSearchRequirementDialog() {
  // Open New Window for Requirement Insertion
  var template = HtmlService.createTemplateFromFile('frontend/searchRequirementDialog');
  var page = template.evaluate();
  var dialog = DocumentApp.getUi().showModalDialog(page, 'Search Requirement');

}

function get_workspaces() {
  Workspaces = JSON.parse(getAuthenticatedValispaceUrl('workspace/'));
  Workspaces.sort(sortNameAlphabeticaly);
  return Workspaces
}
function get_projects(workspaceID) {
  Projects = JSON.parse(getAuthenticatedValispaceUrl('project/?workspace=' + workspaceID));
  Projects.sort(sortNameAlphabeticaly);

  return Projects
}

function sortNameAlphabeticaly(a, b) {
  a_ = a.name.toUpperCase()
  b_ = b.name.toUpperCase()
  if (a_ == b_)
    return 0;
  if (a_ < b_)
    return -1;
  if (a_ > b_)
    return 1;
};


function set_project(projectID) {
  PropertiesService.getUserProperties().setProperty('projectID', projectID);
}
