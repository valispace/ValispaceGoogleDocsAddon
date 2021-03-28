
var reqIcon = '<i class="tree fas fa-file-alt"></i>'
var sectionIcon = '<i class="tree fas fa-copy"></i>'
var specificationIcon = '<i class="tree fas fa-book"></i>'
var folderIcon = '<i class="tree fas fa-folder"></i>'



function buildRequirementTreeHtml() {
  // RequirementsTree = getRequirementsTree()  
  RequirementsTree.build(true);
  html = '<ul class="reqTreeMain">'
  html = html.concat(recursiveFunction(RequirementsTree.root_nodes))
  html.concat('</ul>')
  return html
}

function recursiveFunction(object, html = '') {
  //  Insert HTML text
  for (element in object) {
    item = object[element]

    // If label (Folder)
    if (item.type.name == 'labels') {
      html = html.concat(labelHtml(item))
    }
    // If Specification
    if (item.type.name == 'specifications') {
      specificationHtml
      html = html.concat(specificationHtml(item))
    }
    // If Requirement
    if (item.type.name == 'requirements') {
      html = html.concat(requirementHtml(item))
    }
    // If Group (Section)
    if (item.type.name == 'groups') {
      html = html.concat(groupHtml(item))
    } 

    //  If Object.children is not empty
    if (item.children != null) {
      //  recursiveFunction
      html = recursiveFunction(item.children, html)
    } else {
      Logger.log('no child')
    }

  }
  return html
}

function labelHtml(item){
  var subhtml = ''
  label_id = 'labels_' + String(item.data.id); 
  subhtml = subhtml.concat('<li class="reqSearcheableObj label" id="',label_id,'"><div class="truncate">', 'Folder: ', String(item.data.name),'</div>', folderIcon, '</li>');

  return subhtml
}

function specificationHtml(item){
  var subhtml = ''
  spec_id = 'specs_' + String(item.data.id); 
  subhtml = subhtml.concat('<li class="reqSearcheableObj specification" id="',spec_id,'"><div class="truncate">', 'Specification: ', String(item.data.name),'</div>', specificationIcon, '</li>');

  return subhtml
}

function groupHtml(item){
  var subhtml = ''
  group_id = 'groups_' + String(item.data.id); 
  subhtml = subhtml.concat('<li class="reqSearcheableObj group" id="',group_id,'"><div class="truncate">', 'Section: ', String(item.data.name),'</div>', sectionIcon, '</li>');

  return subhtml
}

function requirementHtml(item){
  var subhtml = ''
  if (item.data.title == null) {
    reqTitle = ''
  } else {
    reqTitle = ' - '.concat(String(item.data.title))
  }
  requirement_id = 'requirements_' + String(item.data.id);
  subhtml = subhtml.concat('<li class="reqSearcheableObj requirement" id="',requirement_id,'"><div class="truncate">', String(item.data.identifier), reqTitle,'</div>', reqIcon);
  subhtml = subhtml.concat('<ul id="',requirement_id,'_properties" class="dropdown-content">');
  // TODO: Automatically get allowable properties;
  subhtml = subhtml.concat('<li class="property" id="requirements_',String(item.data.id),'_property_identifier">Identifier</a>');
  subhtml = subhtml.concat('<li class="property" id="requirements_',String(item.data.id),'_property_title">Title</a>');
  subhtml = subhtml.concat('<li class="property" id="requirements_',String(item.data.id),'_property_text">Text</a>');
  subhtml = subhtml.concat('<li class="property" id="requirements_',String(item.data.id),'_property_parent">Parent</a>');
  subhtml = subhtml.concat('<li class="property" id="requirements_',String(item.data.id),'_property_children">Children</a>');
  subhtml = subhtml.concat('<li class="property" id="requirements_',String(item.data.id),'_property_section">Section</a>');
  subhtml = subhtml.concat('<li class="property" id="requirements_',String(item.data.id),'_property_images">Images</a>');
  subhtml = subhtml.concat('<li class="property" id="requirements_',String(item.data.id),'_property_files">Files</a>');
  subhtml = subhtml.concat('</ul>');
  subhtml = subhtml.concat('</li>');

  return subhtml
}