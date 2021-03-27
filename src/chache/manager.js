// ****************************************************************************************
// Valispace new Caches Managers
// ****************************************************************************************

WorkspacesCache = new Cache(types.workspaces)

ProjectsCache = new Cache(types.projects)

SpecificationsCache = new Cache(types.requirements.specifications)
LabelsCache = new Cache(types.requirements.specifications.labels)
GroupsCache = new Cache(types.requirements.groups)
RequirementsCache = new Cache(types.requirements)

UsersCache = new Cache(types.users)
UserGroupsCache = new Cache(types.user_groups)

TagsCache = new Cache(types.tags)
FilesCache = new Cache(types.files)