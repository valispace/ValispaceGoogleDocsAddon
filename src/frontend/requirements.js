function get_data(projectId, dataType) {
  switch (dataType) {
    case 'labelsData':
      return JSON.parse(getAuthenticatedValispaceUrl('requirements/specifications/labels/?project=' + projectId));
    case 'specificationsData':
      return JSON.parse(getAuthenticatedValispaceUrl('requirements/specifications/full_list/?project=' + projectId + '&clean_text=description'));
    case 'requirementsData':
      return JSON.parse(getAuthenticatedValispaceUrl('requirements/full_list/?project=' + projectId + '&clean_text=text,comment'));
    case 'tagsData':
      return JSON.parse(getAuthenticatedValispaceUrl('tag/'));
    case 'filesData':
      return JSON.parse(getAuthenticatedValispaceUrl('files/?project=' + projectId));
    case 'groupsData':
      return JSON.parse(getAuthenticatedValispaceUrl('requirements/groups/?project=' + projectId));
    case 'usersData':
      return JSON.parse(getAuthenticatedValispaceUrl('user'));
    case 'user_groupsData':
      return JSON.parse(getAuthenticatedValispaceUrl('group'));

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
    text += reqsInSpec[req]['identifier'] + ': ' + reqsInSpec[req]['text'] + '\n'
  }
  body.appendParagraph(text)
}


function insertRequirements_asTable(requirements, parent) {
  var parent = parent.split("_");
  var parentType = parent[0].toString();
  var parentId = parseInt(parent[1]);
  // parentId = parseInt(parentId[parentId.length - 1])

  if (parentType === 'specification') {
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



function direct_insert(objectList, objectName, property) {
  specificationsData = objectList['specifications']
  labelsData = objectList['labels']
  requirementsData = objectList['requirements']
  groupsData = objectList['groups']
  tagsData = objectList['tags']
  filesData = objectList['files']
  usersData = objectList['users']
  user_groupsData = objectList['user_groups']
  var id = objectName.split("_");
  var parentType = id[0].toString();
  var parentId = parseInt(id[1]);
  console.log(parentType, parentId)
  requirements = requirementsData

  var object = objectList[types[parentType].name].find(x => x['id'] === parentId);
  var url_meta = urlTranslator(object, types[parentType]);
  var insertion_type = 'text';
  text_to_insert = '-';
  if (object[property]) {
    text_to_insert = object[property];
  }
  if(property=='owner'){
    text_to_insert = getUserFrom(object[property] ,usersData, user_groupsData);
  }
  if (property=='tags') {
    text_to_insert = replaceAttributesWithId('tags', tagsData, requirements, parentId, 'name')
  }
  // Replacing Group (Section) Name
  else if (property=='section') {
    text_to_insert = replaceAttributesWithId('group', groupsData, requirements, parentId, 'name')
  }
  // Replacing Parent Name
  else if (property=='parents') {
    //            textToInsert = replaceParents(requirements, req, 'identifier')
    text_to_insert = replaceAttributesWithId('parents', requirementsData, requirements, parentId, 'identifier')
  }
  // Replacing Children Name
  else if (property=='children') {
    //            textToInsert = replaceParents(requirements, req, 'identifier')
    text_to_insert = replaceAttributesWithId('children', requirementsData, requirements, parentId, 'identifier')
  }
  // Replacing Files Names
  else if (property=='files') {
    reqId = parentId
    text_to_insert = getFilesInRequirement(filesData, reqId)
  }
  if(property == 'images'){
    text_to_insert = getImagesinFilesInRequirement(filesData, parentId);
    insertion_type = 'image';
  }

  var insertion_data = new InsertionData(
    text_to_insert,
    url_meta,
    objectName,
    property
  );
  Inserter.insert(insertion_data, insertion_type);
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

function insertRequirementsInSpec_asTable_fromTemplate(projectId, parentId, parentType, requirements, requirementsList, tagsList, groupsList, filesList, previousTableIndex = null) {

  // var parent = parent.split("_");
  // var parentType = parent[0].toString();
  // var parentId = parseInt(parent[1]);
  // TODO: Fix the Parent ID, I am using only for specification bellow.

  // TODO: Missing other objects list

  documentId = PropertiesService.getDocumentProperties().getProperty('TemplateDocumentId')
  values = getTemplateTable2(documentId)
  templateTableData = values[0]
  templateTableCellAttributes = values[1]

  var table = []
  var styleTableMapping = []
  var urlMapping = []

  // Header
  if (previousTableIndex == null) {
    header = []
    headerStyle = []
    headerUrl = []

    rowIndex = 0
    for (let cellIndex = 0; cellIndex < templateTableData[rowIndex].length; cellIndex++) {
      header.push(templateTableData[rowIndex][cellIndex])
      headerStyle.push([[rowIndex], [cellIndex]])
      headerUrl.push([])
    }
    table.push(header)
    styleTableMapping.push(headerStyle)
    urlMapping.push(headerUrl)
  }


  for (req in requirements) {
    if (requirements[req][types[parentType].filter] === parentId) {
      for (let rowIndex = 1; rowIndex < templateTableData.length; rowIndex++) {
        subTableRow = []
        subTableStyleRow = []
        subUrlMapping = []
        for (let cellIndex = 0; cellIndex < templateTableData[rowIndex].length; cellIndex++) {
          cellValue = templateTableData[rowIndex][cellIndex]
          // Replacing Tags (folder) Name
          if (cellValue.includes('$tags')) {
            textToInsert = replaceAttributesWithId('tags', tagsList, requirements, requirements[req].id, 'name')
          }
          // Replacing Group (Section) Name
          else if (cellValue.includes('$section')) {
            textToInsert = replaceAttributesWithId('group', groupsList, requirements,  requirements[req].id, 'name')
          }
          // Replacing Parent Name
          else if (cellValue.includes('$parents')) {
            //            textToInsert = replaceParents(requirements, req, 'identifier')
            textToInsert = replaceAttributesWithId('parents', requirementsList, requirements,  requirements[req].id, 'identifier')
          }
          // Replacing Children Name
          else if (cellValue.includes('$children')) {
            //            textToInsert = replaceParents(requirements, req, 'identifier')
            textToInsert = replaceAttributesWithId('children', requirementsList, requirements,  requirements[req].id, 'identifier')
          }
          // Replacing Files Names
          else if (cellValue.includes('$files')) {
            reqId = requirements[req]['id']
            textToInsert = getFilesInRequirement(filesList, reqId)
          }
          // Replacing Images
          else if (cellValue.includes('$images')) {
            reqId = requirements[req]['id']
            textToInsert = getImagesinFilesInRequirement(filesList, reqId)
          }
          // Replacing Other Attributes
          else if (cellValue.includes('$')) {
            attribute = cellValue.replace('$', '')
            textToInsert = requirements[req][attribute].toString()
          } else {
            textToInsert = cellValue
          }
          subTableRow.push(textToInsert)
          subUrlMapping.push(urlTranslator(requirements[req], types['requirements']) + `?from=valispace&name=requirements_${requirements[req].id}__${cellValue.replace('$', '')}`);
          subTableStyleRow.push([[rowIndex], [cellIndex]])
        }
        table.push(subTableRow)
        styleTableMapping.push(subTableStyleRow)
        urlMapping.push(subUrlMapping)
      }
    }
  }

  // Inserting Table
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  var cursor = doc.getCursor();

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


  // var tableIndex = body.getChildIndex(docTable)
  doc.saveAndClose()



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


    rowIndex = formatingTable3(docTable, styleTableMapping, urlMapping, templateTableCellAttributes, rowIndex, cellLimit)
    doc.saveAndClose()

  }

  // TODO: Put this Function inside the Loop and work with cell, instead of entire table
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  var docTable = body.getChild(tableIndex)

  findAndReplaceImages(docTable)
  doc.saveAndClose()

  return tableIndex
  // return [table, styleTableMapping]
}

function getUserFrom(origin, usersData, user_groupsData){
  console.log(origin)
  text = '-'
  if (origin.contenttype==5){
    user = usersData.find(x => x['id'] === origin.id)
    if(user.first_name || user.last_name){
      text = user.first_name + ' ' + user.last_name
    }
  }
  else if (origin.contenttype==4){
    group = user_groupsData.find(x => x['id'] === origin.id)
    if (group.name){
      text = group.name
    }
  }
  return text
}

function replaceAttributesWithId(attribute, objectsList, requirementsList, req, attributeToInsert) {
  objectsIds = requirementsList.find(x => x['id'] === req)[attribute];
  textToInsert = ''
  for (index in objectsIds) {
    objectId = objectsIds[index]
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

  for (fileIndex in filesOnReq) {
    var imageURL = filesOnReq[fileIndex]['download_url']
    textToInsert += '$START_IMG_META=' +
                    '$START_IMG_ID=files_' +filesOnReq[fileIndex]['id'] +'$END_IMG_ID'+
                    '$START_IMG_URL=' +imageURL +'$END_IMG_URL'+
                    '$END_IMG_META'
    //
  }
  return textToInsert
}

function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function replaceImagesURLToFile(element) {

  var text = element.getText()
  var meta_url = element.getLinkUrl().split('name=requirements')[0]
  var image_metas = text.split('$END_IMG_META')

  for (index in image_metas) {
    var meta = image_metas[index]
    if (meta.includes('$START_IMG_URL')) {

      url = meta.split('$START_IMG_URL=')[1].split('$END_IMG_URL')[0]
      meta_url += 'name=' + meta.split('$START_IMG_ID=')[1].split('$END_IMG_ID')[0]
      //      Logger.log(url)

      var imgBlob = UrlFetchApp.fetch(url).getBlob();

      var searchText = image_metas[index] + '$END_IMG_META'
      searchText = escapeRegExp(searchText)

      // var element = body.findText(searchText);

      var img = element.getParent().asParagraph().insertInlineImage(0, imgBlob);
      element.replaceText(searchText, '');
      img.setLinkUrl(meta_url)
    }
  }
}

function findAndReplaceImages(origin) {
  // if(origin == undefined || origin == null){
  //   origin = DocumentApp.getActiveDocument().getBody();
  // }
  // element = origin.findText('$START_IMG_URL=')
  // while(element != null){
  //   replaceImagesURLToFile(element.getElement())
  //   element = origin.findText('$START_IMG_URL=')
  // }
  table = origin
  body = DocumentApp.getActiveDocument().getBody();
  for (let rowIndex = 0; rowIndex < table.getNumRows(); rowIndex++) {
    for (let columnIndex = 0; columnIndex < numColumns; columnIndex++) {
      cellContent = table.getCell(rowIndex, columnIndex).getText()
      if (cellContent.includes('$START_IMG_META=')) {

        replaceImagesURLToFile(table.getCell(rowIndex, columnIndex).getChild(0).getChild(0))
      }
    }
  }
}


function formatingTable3(table, styleTableMapping, urlMapping, templateTableCellAttributes, startingRow, cellLimit) {
  counter = 0


  numColumns = table.getRow(0).getNumCells()
  for (let rowIndex = startingRow; rowIndex < table.getNumRows(); rowIndex++) {
    for (let columnIndex = 0; columnIndex < numColumns; columnIndex++) {
      counter += 1
      cellStyleLocation = styleTableMapping[rowIndex][columnIndex]
      styleCellAttributes = templateTableCellAttributes[cellStyleLocation[0]][cellStyleLocation[1]]
      //      styleTextAttributes = templateTableTextAttributes[cellStyleLocation[0]][cellStyleLocation[1]]

      Logger.log([rowIndex, columnIndex])

      delete styleCellAttributes[DocumentApp.Attribute.LINK_URL]
      table.getCell(rowIndex, columnIndex).setLinkUrl(urlMapping[rowIndex][columnIndex])
      table.getCell(rowIndex, columnIndex).setAttributes(styleCellAttributes)


    }
    if (counter > cellLimit) {
      return rowIndex
    }
  }
}
