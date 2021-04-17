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
    // Logger.log(reqsInSpec[req])
    text += reqsInSpec[req]['identifier'] + ': ' + reqsInSpec[req]['text'] + '\n'
  }
  body.appendParagraph(text)
}


function insertRequirements_asTable(requirements, parent) {
  var parent = parent.split("_");
  var parentType = parent[0].toString();
  var parentId = parseInt(parent[1]);
  // Logger.log(parent)
  // Logger.log(parentId)
  // Logger.log(parentType)
  // parentId = parseInt(parentId[parentId.length - 1])

  if (parentType === "specs") {
    parentType = 'specification'
    var reqsToInsert = requirements.filter(x => x[parentType] === parentId)
  } else if (parentType === "groups") {
    parentType = 'group'
    var reqsToInsert = requirements.filter(x => x[parentType] === parentId)
  }



  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  var cursor = doc.getCursor();
  var indexCursor = getCursorIndex(body, cursor)

  var cells = []
  for (req in reqsToInsert) {
    if (reqsToInsert[req][parentType] === parentId) {
      cells.push([reqsToInsert[req]['identifier'], reqsToInsert[req]['text']])
    }
  }

  var docTable = body.insertTable(indexCursor, cells)
  //  return cells
}

function getCursorIndex(body, cursor) {

  if (cursor) {
    var element = cursor.getElement();
    // Get the first Body Section parent of the element
    while (element.getParent().getType() != DocumentApp.ElementType.BODY_SECTION) {
      element = element.getParent();
    }
    var index = body.getChildIndex(element);
  }
  else {
    DocumentApp.getUi().alert("Could not find current position. Please click on the text where you want to add the requirement.");
    return;
  }
  return index
}


function direct_insert(objectList, parent, property) {
  var parent = parent.split("_");
  var parentType = parent[0].toString();
  var parentId = parseInt(parent[1]);

  // if (parentType === "specs"){
  //   parentType = 'specification'
  //   var reqsToInsert = requirements.filter(x => x[parentType] === parentId)
  // } else if (parentType === "groups") {
  //   parentType = 'group'
  //   var reqsToInsert = requirements.filter(x => x[parentType] === parentId)
  // }

  // Logger.log(objectList)
  // Logger.log(parentId)
  // Logger.log(parentType)

  var object = objectList.find(x => x['id'] === parentId)

  // Logger.log(object)
  var text = ''
  text += object['name'] + '\n'
  // Logger.log(text)


  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  var cursor = doc.getCursor();
  var indexCursor = getCursorIndex(body, cursor)

  var docTable = body.insertParagraph(indexCursor, text)
}

function getTemplateTable2(documentId) {
  templateTableData = []
  templateTableCellAttributes = []
  //  templateTableTextAttributes = []

  var body = DocumentApp.openById(documentId).getBody()
  table = body.getTables()[0]

  numColumns = table.getRow(0).getNumCells()
  for (let rowIndex = 0; rowIndex < table.getNumRows(); rowIndex++) {
    rowData = []
    rowCellAttributes = []
    //    rowTextAttributes = []

    for (let columnIndex = 0; columnIndex < numColumns; columnIndex++) {
      rowData.push(table.getCell(rowIndex, columnIndex).getText())
      rowCellAttributes.push(table.getCell(rowIndex, columnIndex).getAttributes())
      //      rowTextAttributes.push(table.getCell(rowIndex, columnIndex).getAttributes())
    }
    templateTableData.push(rowData)
    templateTableCellAttributes.push(rowCellAttributes)
    //    templateTableTextAttributes.push(rowTextAttributes)
  }

  //  return [templateTableData, templateTableCellAttributes, templateTableTextAttributes]
  return [templateTableData, templateTableCellAttributes]
}

function insertRequirementsInSpec_asTable_fromTemplate(projectId, parentId, requirements, requirementsList, tagsList, groupsList, filesList, previousTableIndex = null) {

  // var parent = parent.split("_");
  // var parentType = parent[0].toString();
  // var parentId = parseInt(parent[1]);
  // TODO: Fix the Parent ID, I am using only for specification bellow.

  // TODO: Missing other objects list

  // TODO: Get From UserProperties
  documentId = PropertiesService.getDocumentProperties().getProperty('ReqTableID');
  values = getTemplateTable2(documentId)
  templateTableData = values[0]
  templateTableCellAttributes = values[1]

  // Logger.log('Got Template')

  var table = []
  var styleTableMapping = []


  for (req in requirements) {
    if (requirements[req]['specification'] === parentId) {
      for (let rowIndex = 1; rowIndex < templateTableData.length; rowIndex++) {
        subTableRow = []
        subTableStyleRow = []
        for (let cellIndex = 0; cellIndex < templateTableData[rowIndex].length; cellIndex++) {
          cellValue = templateTableData[rowIndex][cellIndex]
          // Replacing Tags (folder) Name
          if (cellValue.includes('$tags')) {
            textToInsert = replaceAttributesWithId('tags', tagsList, requirements, req, 'name')
            subTableRow.push(textToInsert)
          }
          // Replacing Group (Section) Name
          else if (cellValue.includes('$section')) {
            textToInsert = replaceAttributesWithId('group', groupsList, requirements, req, 'name')
            subTableRow.push(textToInsert)
          }
          // Replacing Parent Name
          else if (cellValue.includes('$parents')) {
            //            textToInsert = replaceParents(requirements, req, 'identifier')
            replaceAttributesWithId('parents', requirementsList, requirements, req, 'identifier')
            subTableRow.push(textToInsert)
          }
          // Replacing Children Name
          else if (cellValue.includes('$children')) {
            //            textToInsert = replaceParents(requirements, req, 'identifier')
            replaceAttributesWithId('children', requirementsList, requirements, req, 'identifier')
            subTableRow.push(textToInsert)
          }
          // Replacing Files Names
          else if (cellValue.includes('$files')) {
            reqId = requirements[req]['id']
            textToInsert = getFilesInRequirement(filesList, reqId)
            subTableRow.push(textToInsert)
          }
          // Replacing Images
          else if (cellValue.includes('$images')) {
            reqId = requirements[req]['id']
            imgBlob = getImagesinFilesInRequirement(filesList, reqId)
            subTableRow.push(imgBlob)
          }
          // Replacing Other Attributes
          else if (cellValue.includes('$')) {
            attribute = cellValue.replace('$', '')
            subTableRow.push(requirements[req][attribute].toString())
          } else {
            subTableRow.push(cellValue)
          }
          subTableStyleRow.push([[rowIndex], [cellIndex]])
        }
        table.push(subTableRow)
        styleTableMapping.push(subTableStyleRow)
      }
    }
  }

  // Inserting Table
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  var cursor = doc.getCursor();

  Logger.log(previousTableIndex)

  if (previousTableIndex == null) {
    var indexCursor = getCursorIndex(body, cursor);
    if (indexCursor == 0) {
      indexCursor = 1;
    };
  } else {
    var indexCursor = previousTableIndex + 1;
  };

  var docTable = body.insertTable(indexCursor, table)
  var tableIndex = body.getChildIndex(docTable)

  Logger.log(tableIndex)

  // Logger.log('Table Inserted')
  // var tableIndex = body.getChildIndex(docTable)
  doc.saveAndClose()
  // Logger.log('Saved and Closed')



  // Formating Table
  tableLength = docTable.getNumRows()
  cellLimit = 4000
  rowIndex = 0
  while (rowIndex < tableLength) {


    var doc = DocumentApp.getActiveDocument();
    var body = doc.getBody();

    //TODO Chck if child is not a table
    var docTable = body.getChild(tableIndex)

    if (docTable.getType() == DocumentApp.ElementType.PARAGRAPH) {
      tableIndex = tableIndex + 1;
      docTable = body.getChild(tableIndex);
    }
    // Logger.log('Table Index: ' + tableIndex)
    // Logger.log('Child Type: ' + docTable.getType())
    // Logger.log('Child Text: ' + docTable.getText())

    // Logger.log('Formating Table')
    rowIndex = formatingTable3(docTable, styleTableMapping, templateTableCellAttributes, rowIndex, cellLimit)
    // Logger.log('Table Formated')
    doc.saveAndClose()
    // Logger.log('Saved and Closed')

  }

  // TODO: Put this Function inside the Loop and work with cell, instead of entire table
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  var docTable = body.getChild(tableIndex)
  Logger.log('Table Index: ' + tableIndex)
  Logger.log('Child Type: ' + docTable.getType())
  Logger.log('Child Text: ' + docTable.getText())
  findAndReplaceImages(body, docTable)
  doc.saveAndClose()

  return tableIndex
  // return [table, styleTableMapping]
}


function replaceAttributesWithId(attribute, objectsList, requirementsList, req, attributeToInsert) {
  objectsIds = requirementsList[req][attribute]
  textToInsert = ''
  for (index in objectsIds) {
    objectId = objectsIds[index]
    //    Logger.log(objectId)
    var object = objectsList.find(x => x['id'] === objectId)
    textToInsert += object[attributeToInsert] + ', '
  }
  return textToInsert
}

function getFilesInRequirement(filesList, reqId) {

  textToInsert = ''
  var filesOnReq = filesList.filter(x => x['object_id'] === reqId)


  for (fileIndex in filesOnReq) {

    if (filesOnReq[fileIndex]['file_type'] === 1) {
      textToInsert += filesOnReq[fileIndex]['name'] + ", "
    } else if (filesOnReq[fileIndex]['file_type'] === 2) {
      textToInsert += filesOnReq[fileIndex]['name'] + ", "
    } else if (filesOnReq[fileIndex]['file_type'] === 3) {
      referenceFileId = filesOnReq[fileIndex]['reference_file']
      originalFileId = filesList.find(x => x['id'] === referenceFileId)
      textToInsert += originalFileId['name'] + ", "
    }

  }
  return textToInsert
}

function getImagesinFilesInRequirement(filesList, reqId) {

  textToInsert = ''
  var filesOnReq = filesList.filter(x => x['object_id'] === reqId & x['mimetype'] === "image/jpeg")

  // Logger.log('Files on Req:', filesOnReq)

  for (fileIndex in filesOnReq) {
    var imageURL = filesOnReq[fileIndex]['download_url']
    textToInsert += '$START_IMG_URL=' + imageURL + '$ENG_IMG_URL '
    //     
  }
  return textToInsert
}

function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function replaceImagesURLToFile(body, text) {


  var image_urls = text.split('$ENG_IMG_URL')

  for (index in image_urls) {
    var url = image_urls[index]
    if (url.includes('$START_IMG_URL')) {

      url = url.split('$START_IMG_URL=')[1]
      //      Logger.log(url)

      var imgBlob = UrlFetchApp.fetch(url).getBlob();

      var searchText = '$START_IMG_URL=' + url + '$ENG_IMG_URL'
      searchText = escapeRegExp(searchText)
      // Logger.log(searchText)

      var element = body.findText(searchText);
      // Logger.log(element)

      if (element != null) {
        var textElement = element.getElement();
        var img = textElement.getParent().asParagraph().insertInlineImage(0, imgBlob);
        body.replaceText(searchText, '');
      }
    }
  }
}

function findAndReplaceImages(body, table) {

  for (let rowIndex = 0; rowIndex < table.getNumRows(); rowIndex++) {
    for (let columnIndex = 0; columnIndex < numColumns; columnIndex++) {
      cellContent = table.getCell(rowIndex, columnIndex).getText()
      if (cellContent.includes('$START_IMG_URL=')) {
        replaceImagesURLToFile(body, cellContent)
      }
    }
  }
}

function formatingTable3(table, styleTableMapping, templateTableCellAttributes, startingRow, cellLimit) {
  counter = 0

  //  Logger.log(startingRow)

  numColumns = table.getRow(0).getNumCells()
  for (let rowIndex = startingRow; rowIndex < table.getNumRows(); rowIndex++) {
    for (let columnIndex = 0; columnIndex < numColumns; columnIndex++) {
      counter += 1
      cellStyleLocation = styleTableMapping[rowIndex][columnIndex]
      styleCellAttributes = templateTableCellAttributes[cellStyleLocation[0]][cellStyleLocation[1]]
      //      styleTextAttributes = templateTableTextAttributes[cellStyleLocation[0]][cellStyleLocation[1]]

      styleCell = {};
      for (attributeName in styleCellAttributes) {
        if (styleCellAttributes[attributeName] != null && styleCellAttributes[attributeName] != "") {
          styleCell[DocumentApp.Attribute[attributeName]] = styleCellAttributes[attributeName]
        }
      }

      table.getCell(rowIndex, columnIndex).setAttributes(styleCell)


    }
    if (counter > cellLimit) {
      return rowIndex
    }
  }
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