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
