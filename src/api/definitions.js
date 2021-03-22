var types = {
  workspaces:{},
  projects:{},
  requirements:{
    specifications:{
      labels:{},
    },
    groups:{},
  },
  users:{},
  user_groups:{},
  tags:{},
  files:{}
}

// ****************************************************************************************
// Valispace REST - Users Groups
// ****************************************************************************************

types.users.get = function (){
  return JSON.parse(getAuthenticatedValispaceUrl('user'));
}

types.user_groups.get = function (){
  return JSON.parse(getAuthenticatedValispaceUrl('group'));
}


// ****************************************************************************************
// Valispace REST - Workspaces
// ****************************************************************************************

types.workspaces.get = function (){
  return JSON.parse(getAuthenticatedValispaceUrl('workspace'));
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
types.projects.get = function (workspaceID){
  return JSON.parse(getAuthenticatedValispaceUrl('project/?workspace='+workspaceID));
}

// ****************************************************************************************
// Valispace REST - Requirements
// ****************************************************************************************

/**
 * Returns a list of specifications within a project.
 * @param  {int} project_id - Project ID
 * @return {[type]}      [description]
 */
types.requirements.specifications.get = function (project_id){
  return JSON.parse(getAuthenticatedValispaceUrl('requirements/specifications/?project='+project_id));
}

/**
 * Returns a list of labels (folders) within a project.
 * @param  {int} project_id - Project ID
 * @return {[type]}      [description]
 */
types.requirements.specifications.labels.get = function (project_id){
  return JSON.parse(getAuthenticatedValispaceUrl('requirements/specifications/labels/?project='+project_id));
}
/**
 * Returns a list of groups (sections) within a project.
 * @param  {int} project_id - Project ID
 * @return {[type]}      [description]
 */
types.requirements.groups.get = function (project_id){
  return JSON.parse(getAuthenticatedValispaceUrl('requirements/groups/?project='+project_id));
}

/**
 * Returns the complete table of requirements, including VM, with clean text.
 * @param  {int} project_id - Project ID
 * @return {[type]}      [description]
 */
types.requirements.get = function (project_id){
  return JSON.parse(getAuthenticatedValispaceUrl('requirements/complete/?project='+project_id+';clean_text=text,comment'));
}

// ****************************************************************************************
// Valispace REST - Tags
// ****************************************************************************************
types.tags.get = function (){
  return JSON.parse(getAuthenticatedValispaceUrl('tag'));
}

types.files.get = function(project_id){
  return JSON.parse(getAuthenticatedValispaceUrl('files/?project='+project_id));
}

// ****************************************************************************************
// Valispace REST - Components
// ****************************************************************************************

// ****************************************************************************************
// Valispace REST - Valis
// ****************************************************************************************
