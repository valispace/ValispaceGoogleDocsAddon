var types = {
  workspaces:{name:'workspaces',
              url: '',
              data:'workspacesData'},
  projects:{name:'projects',
              url: '',
              data:'projectsData'},
  requirements:{name:'requirements',
              url: ['project','%project','specifications','%specification','requirements','%id'],
              data:'requirementsData',
              properties:["identifier","title","text","parents","children","section","images","files"],
              filter: 'id'},
  specifications:{name:'specifications',
              url: ['project','%project','specifications','%id','requirements'],
              data:'specificationsData',
              properties:["name", "description", "owner"],
              filter: 'specification'},
  labels:{name:'labels',
              url: ['project','%project','specifications','groups','%id','requirements'],
              data:'labelsData'},
  groups:{name:'groups',
              url: ['project','%project','specifications','requirements','groups','%id','requirements'],
              data:'groupsData',
              properties:["name", "description", "owner"],
              filter: 'group'},
  users:{name:'users',
              url: '',
              data:'usersData'},
  user_groups:{name:'user_groups',
              url: '',
              data:'user_groupsData'},
  tags:{name:'tags',
              url: '',
              data:'tagsData'},
  files:{name:'files',
              url: '',
              data:'filesData'}
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
types.specifications.get = function (project_id){
  return JSON.parse(getAuthenticatedValispaceUrl('requirements/specifications/?project='+project_id));
}

types.specifications.tree = function (data){
  var subhtml = ''
  subhtml = subhtml.concat('<li class="reqSearcheableObj ', this.name,'" id="', this.name,'_', data.id, '">', expandIcon, specificationIcon, '<div class="truncated-text">', 'Specification: ', String(data.name), '</div>', plusIcon, '</li>');

  return subhtml
}

/**
 * Returns a list of labels (folders) within a project.
 * @param  {int} project_id - Project ID
 * @return {[type]}      [description]
 */
types.labels.get = function (project_id){
  return JSON.parse(getAuthenticatedValispaceUrl('requirements/specifications/labels/?project='+project_id));
}

types.labels.tree = function (data){
  var subhtml = ''
  subhtml = subhtml.concat('<li class="reqSearcheableObj ', this.name,'" id="', this.name,'_', data.id, '">', expandIcon, folderIcon, '<div class="truncated-text">', 'Folder: ', String(data.name), '</div>', plusIcon, '</li>');

  return subhtml
}
/**
 * Returns a list of groups (sections) within a project.
 * @param  {int} project_id - Project ID
 * @return {[type]}      [description]
 */
types.groups.get = function (project_id){
  return JSON.parse(getAuthenticatedValispaceUrl('requirements/groups/?project='+project_id));
}

types.groups.tree = function (data){
  var subhtml = ''
  subhtml = subhtml.concat('<li class="reqSearcheableObj ', this.name,'" id="', this.name,'_', data.id, '">', expandIcon, sectionIcon, '<div class="truncated-text">', 'Section: ', String(data.name), '</div>', plusIcon, '</li>');

  return subhtml
}

/**
 * Returns the complete table of requirements, including VM, with clean text.
 * @param  {int} project_id - Project ID
 * @return {[type]}      [description]
 */
types.requirements.get = function (project_id){
  return JSON.parse(getAuthenticatedValispaceUrl('requirements/full_list/?project='+project_id+'&clean_text=text,comment'));
}

types.requirements.tree = function (data){
  var subhtml = ''
  if (data.title == '-') {
    reqTitle = ''
  } else {
    reqTitle = ' - '.concat(String(data.title))
  }
  subhtml = subhtml.concat('<li class="reqSearcheableObj ', this.name,'" id="',this.name,'_', data.id, '">', expandIcon, reqIcon, '<div class="truncated-text">', String(data.identifier), reqTitle, '</div>');
  subhtml = subhtml.concat('<ul id="',this.name,'_', data.id, '_properties" class="dropdown-content">');
  // TODO: Automatically get allowable properties;
  // for(property of Object.keys(data)){
  //   subhtml = subhtml.concat('<li class="property" id="', this.name,'_', data.id, '_property_', property,'">', property,'</a>');
  // }
  subhtml = subhtml.concat('<li class="property" id="requirements_', String(data.id), '_property_identifier">Identifier</a>');
  subhtml = subhtml.concat('<li class="property" id="requirements_', String(data.id), '_property_title">Title</a>');
  subhtml = subhtml.concat('<li class="property" id="requirements_', String(data.id), '_property_text">Text</a>');
  subhtml = subhtml.concat('<li class="property" id="requirements_', String(data.id), '_property_parents">Parents</a>');
  subhtml = subhtml.concat('<li class="property" id="requirements_', String(data.id), '_property_children">Children</a>');
  subhtml = subhtml.concat('<li class="property" id="requirements_', String(data.id), '_property_section">Section</a>');
  subhtml = subhtml.concat('<li class="property" id="requirements_', String(data.id), '_property_image">Images</a>');
  subhtml = subhtml.concat('<li class="property" id="requirements_', String(data.id), '_property_files">Files</a>');
  subhtml = subhtml.concat('</ul>');
  subhtml = subhtml.concat('</li>');
  return subhtml
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
