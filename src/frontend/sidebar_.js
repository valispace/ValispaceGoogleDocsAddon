function get_workspaces() {
  Workspaces = types.workspaces.get();
  Workspaces.sort(sortNameAlphabeticaly);
  return Workspaces
}
function get_projects(workspaceID) {
  Projects = types.projects.get(workspaceID);
  Projects.sort(sortNameAlphabeticaly);
  return Projects
}

function set_project(projectID) {
  PropertiesService.getUserProperties().setProperty('projectID', projectID);
}

function loadModule(module) {
  var template = HtmlService.createTemplateFromFile('frontend/' + module + '/' + module);
  var page = template.evaluate();
  page.setTitle('Valispace on Google Docs');
  DocumentApp.getUi().showSidebar(page);
}