// Should all the REST calls be organized here, or divided by module/function (e.g.: for requirements, for valis)?


// ****************************************************************************************
// Valispace REST - Workspaces
// ****************************************************************************************
/**
 * Ask for a simplified list of all workspaces in the current deployment.
 * @typedef {{
 *    id: int,
 *    name: string
 *  }} workspace
  * @return {list(workspace)}      dictionary of worspaces
 */
function get_workspaces(){
  var allWorkspaces = JSON.parse(getAuthenticatedValispaceUrl('workspace').getContentText());
  workspaceList = "[{\"name\":\"" + allWorkspaces[0].name + "\",\"id\":" + allWorkspaces[0].id +"}"
  for(i=1; i < allWorkspaces.length; i++){
    workspaceList = workspaceList + ",{\"name\":\"" + allWorkspaces[i].name + "\",\"id\":" + allWorkspaces[i].id +"}"
  }
  workspaceList = workspaceList + "]"
  return(JSON.parse(workspaceList));
}

// ****************************************************************************************
// Valispace REST - Projects
// ****************************************************************************************


/**
 * Ask for a simplified list of all projects (only name and ID) filtered by workspace in the current deployment.
 * @typedef {{
 *    id: int,
 *    name: string
 *  }} project
 * @param  {int} workspaceID - ID of the workspace
 * @return {list(project)}      dictionary of filtered projects
 */
function get_projects_byWorkspace(workspaceID){
  var allProjects = JSON.parse(getAuthenticatedValispaceUrl('project/?workspace='+workspaceID).getContentText());
  projectList = "[{\"name\":\"" + allProjects[0].name + "\",\"id\":" + allProjects[0].id +"}"
  for(i=1; i < allProjects.length; i++){
    projectList = projectList + ",{\"name\":\"" + allProjects[i].name + "\",\"id\":" + allProjects[i].id +"}"
  }
  projectList = projectList + "]"
  return(JSON.parse(projectList));
  
}


// ****************************************************************************************
// Valispace REST - Components
// ****************************************************************************************

// ****************************************************************************************
// Valispace REST - Valis
// ****************************************************************************************

// ****************************************************************************************
// Valispace REST - Workspaces
// ****************************************************************************************

