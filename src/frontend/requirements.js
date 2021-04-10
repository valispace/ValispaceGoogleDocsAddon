var expandIcon = '<i class="expand_icon fas fa-angle-right"></i>'
var reqIcon = '<i class="tree_icon far fa-file-alt"></i>'
var sectionIcon = '<i class="tree_icon fas fa-copy"></i>'
var specificationIcon = '<i class="tree_icon fas fa-book"></i>'
var folderIcon = '<i class="tree_icon fas fa-folder"></i>'
var plusIcon = '<i class="add-element fas fa-plus"></i>'



function get_data(projectId, dataType) {
  switch (dataType) {
    case 'labelsData':
      return JSON.parse(getAuthenticatedValispaceUrl('requirements/specifications/labels/?project=' + projectId));
    case 'specificationsData':
      return JSON.parse(getAuthenticatedValispaceUrl('requirements/specifications/?project=' + projectId));
    case 'requirementsData':
      return JSON.parse(getAuthenticatedValispaceUrl('requirements/full_list/?project=' + projectId + '&clean_text=text,comment'));
    case 'tagsData':
      return JSON.parse(getAuthenticatedValispaceUrl('tag/'));
    case 'filesData':
      return JSON.parse(getAuthenticatedValispaceUrl('files/?project=' + projectId));
    case 'groupsData':
      return JSON.parse(getAuthenticatedValispaceUrl('requirements/groups/?project=' + projectId));

  }
}

// TODO: Move this to a more Generic
function get_tag(tag_id) {
  return JSON.parse(getAuthenticatedValispaceUrl('tag/' + tag_id + '/'));
}

function get_requirement(req_id) {
  return JSON.parse(getAuthenticatedValispaceUrl('requirements/' + req_id + '/'));
}

function get_specification(spec_id) {
  return JSON.parse(getAuthenticatedValispaceUrl('requirements/specifications/' + spec_id));
}


function insertRequirementsInSpec_asText(requirements, spec_id) {
  var spec_id = spec_id.split("_")
  spec_id = parseInt(spec_id[spec_id.length - 1])
  
  var reqsInSpec = requirements.filter(x => x['specification'] === spec_id)
  
  var doc = DocumentApp.getActiveDocument()
  var body = doc.getBody();

  var text = ''
  for (req in reqsInSpec) {
    Logger.log(reqsInSpec[req])
    text += reqsInSpec[req]['identifier'] + ': ' + reqsInSpec[req]['text'] + '\n'
  }
  body.appendParagraph(text)
}


function insertRequirementsInSpec_asTable(requirements, spec_id){
  var spec_id = spec_id.split("_")
  spec_id = parseInt(spec_id[spec_id.length - 1])
  
  var reqsInSpec = requirements.filter(x => x['specification'] === spec_id)

  doc = DocumentApp.getActiveDocument();
  body = doc.getBody();
  
  var cells = []
  for (req in reqsInSpec){
    if (reqsInSpec[req]['specification'] === spec_id){
      cells.push([reqsInSpec[req]['identifier'], reqsInSpec[req]['text']])
    }  
  }
  
  var docTable = body.appendTable(cells)
//  return cells
}

function direct_insert(reqId) {
  Logger.log(`Object to be Inserted - ID:  ${reqId} and Property: ${fieldValue} `)
  //TODO: This doesn't stay in memory needs reload, trouble
  RequirementsTree.build()
  RequirementsTree.insert_value(reqId, fieldValue.toLowerCase())
}

// function buildRequirementTreeHtml() {
//   // RequirementsTree = getRequirementsTree()  
//   RequirementsTree.build(true);
//   html = '<ul class="reqTreeMain">'
//   html = html.concat(recursiveFunction(RequirementsTree.root_nodes))
//   html.concat('</ul>')
//   return html
// }

// function recursiveFunction(object, html = '') {
//   //  Insert HTML text
//   for (element in object) {
//     item = object[element]

//     // If label (Folder)
//     if (item.type.name == 'labels') {
//       object_id = 'labels_' + String(item.data.id);
//       html = html.concat(labelHtml(item, object_id))
//     } else if (item.type.name == 'specifications') {
//       // If Specification
//       object_id = 'specs_' + String(item.data.id);
//       html = html.concat(specificationHtml(item, object_id))
//     } else if (item.type.name == 'groups') {
//       // If Group (Section)
//       object_id = 'groups_' + String(item.data.id);
//       html = html.concat(groupHtml(item, object_id))
//     } else if (item.type.name == 'requirements') {
//       // If Requirement
//       object_id = 'requirements_' + String(item.data.id);
//       html = html.concat(requirementHtml(item, object_id))
//     } else {
//       // TODO better catch exceptions; Not sure if ids are unique
//       object_id = String(item.data.id)
//     }

//     //  If Object.children is not empty
//     if (item.children != null) {
//       //  recursiveFunction
//       html = html.concat('<div class="nested dropdown-content" id="children_', object_id, '">')
//       html = recursiveFunction(item.children, html)
//       html = html.concat('</div>')
//     } else {
//       Logger.log('no child')
//     }

//   }
//   return html
// }

// function labelHtml(item, label_id) {
//   var subhtml = ''
//   subhtml = subhtml.concat('<li class="reqSearcheableObj label" id="', label_id, '">', expandIcon, folderIcon, '<div class="truncated-text">', 'Folder: ', String(item.data.name), '</div>', plusIcon, '</li>');

//   return subhtml
// }

// function specificationHtml(item, spec_id) {
//   var subhtml = ''
//   subhtml = subhtml.concat('<li class="reqSearcheableObj specification" id="', spec_id, '">', expandIcon, specificationIcon, '<div class="truncated-text">', 'Specification: ', String(item.data.name), '</div>', plusIcon, '</li>');

//   return subhtml
// }

// function groupHtml(item, group_id) {
//   var subhtml = ''
//   subhtml = subhtml.concat('<li class="reqSearcheableObj group" id="', group_id, '">', expandIcon, sectionIcon, '<div class="truncated-text">', 'Section: ', String(item.data.name), '</div>', plusIcon, '</li>');

//   return subhtml
// }

// function requirementHtml(item, requirement_id) {
//   var subhtml = ''
//   if (item.data.title == null) {
//     reqTitle = ''
//   } else {
//     reqTitle = ' - '.concat(String(item.data.title))
//   }
//   subhtml = subhtml.concat('<li class="reqSearcheableObj requirement" id="', requirement_id, '">', expandIcon, reqIcon, '<div class="truncated-text">', String(item.data.identifier), reqTitle, '</div>');
//   subhtml = subhtml.concat('<ul id="', requirement_id, '_properties" class="dropdown-content">');
//   // TODO: Automatically get allowable properties;
//   subhtml = subhtml.concat('<li class="property" id="requirements_', String(item.data.id), '_property_identifier">Identifier</a>');
//   subhtml = subhtml.concat('<li class="property" id="requirements_', String(item.data.id), '_property_title">Title</a>');
//   subhtml = subhtml.concat('<li class="property" id="requirements_', String(item.data.id), '_property_text">Text</a>');
//   subhtml = subhtml.concat('<li class="property" id="requirements_', String(item.data.id), '_property_parent">Parent</a>');
//   subhtml = subhtml.concat('<li class="property" id="requirements_', String(item.data.id), '_property_children">Children</a>');
//   subhtml = subhtml.concat('<li class="property" id="requirements_', String(item.data.id), '_property_section">Section</a>');
//   subhtml = subhtml.concat('<li class="property" id="requirements_', String(item.data.id), '_property_images">Images</a>');
//   subhtml = subhtml.concat('<li class="property" id="requirements_', String(item.data.id), '_property_files">Files</a>');
//   subhtml = subhtml.concat('</ul>');
//   subhtml = subhtml.concat('</li>');

//   return subhtml
// }