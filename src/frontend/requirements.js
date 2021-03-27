var allowablePropertiesRequirement = ["id",
"created",
"updated",
"project",
"valicontainer",
"specification",
"identifier",
"title",
"text",
"component_requirements",
"parents",
"children",
"valis",
"used_valis",
"comment",
"tags",
"position",
"owner",
"owner_wgroup"];


function buildRequirementTreeHtml() {
  // RequirementsTree = getRequirementsTree()  
  RequirementsTree.build(true);

  html = recursiveFunction(RequirementsTree.root_nodes)
  return html
}

function recursiveFunction(object, html = '') {
  //  Insert HTML text
  for (element in object) {
    item = object[element]

    // TODO add Id and classes to each type
    // TODO Should this be Generic?
    // Check ID prefix for other objects e.g. requirements_id
    // If label (Folder)
    if (item.type.name == 'labels') {
      html = html.concat('<a class="reqClicable">', 'Folder: ', String(item.data.name), '</a>')
    }
    // If Specification
    if (item.type.name == 'specifications') {
      html = html.concat('<a class="reqClicable">', 'Specification: ', String(item.data.name), '</a>')
    }
    // If Requirement
    if (item.type.name == 'requirements') {
      html = html.concat(requirementHtml(item))
    }
    // If Group (Section)
    if (item.type.name == 'groups') {
      html = html.concat('<a class="reqClicable">', 'Section: ', String(item.data.name), '</a>')
    }

    // Expandable Option for Property Selection
    

    //  If Object.children is not empty
    if (item.children != null) {
      //  recursiveFunction
      html = recursiveFunction(item.children, html)
    } else {
      Logger.log('no child')
    }
    //  Else
    //  end?
  }
  return html
}

function requirementHtml(item){
  var subhtml = ''
  if (item.data.title == null) {
    reqTitle = ''
  } else {
    reqTitle = ' - '.concat(String(item.data.title))
  }
  requirement_id = 'requirements_' + String(item.data.id);
  subhtml = subhtml.concat('<a class="requirement" id="',requirement_id,'">', String(item.data.identifier), reqTitle, '</a>');
  subhtml = subhtml.concat('<div id="',requirement_id,'_properties" class="dropdown-content">');
  // TODO: Automatically get allowable properties;
  subhtml = subhtml.concat('<a class="property" id="requirements_',String(item.data.id),'_property_identifier">Identifier</a>');
  subhtml = subhtml.concat('<a class="property" id="requirements_',String(item.data.id),'_property_title">Title</a>');
  subhtml = subhtml.concat('<a class="property" id="requirements_',String(item.data.id),'_property_text">Text</a>');
  subhtml = subhtml.concat('</div>');

  return subhtml
}