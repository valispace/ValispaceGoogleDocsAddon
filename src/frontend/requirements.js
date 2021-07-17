function get_data(projectId, dataType) {
  switch (dataType) {
    case 'labelsData':
      return JSON.parse(getAuthenticatedValispaceUrl('requirements/specifications/labels/?project=' + projectId));
    case 'specificationsData':
      specificationData = getAuthenticatedValispaceUrl('requirements/specifications/full_list/?project=' + projectId + '&clean_text=description')
      delete specificationData['vpermission']
      delete specificationData['Contenttype']
      return JSON.parse(specificationData);
    case 'requirementsData':
      requirementsData = getAuthenticatedValispaceUrl('requirements/full_list/?project=' + projectId + '&clean_text=text,comment')
      delete requirementsData['Contenttype']
      delete requirementsData['vpermission']
      delete requirementsData['Image_1024']
      delete requirementsData['Image_512']
      delete requirementsData['Image_256']
      delete requirementsData['Image_128']
      delete requirementsData['Image_64']
      return JSON.parse(requirementsData);
    case 'groupsData':
      groupData = getAuthenticatedValispaceUrl('requirements/groups/?project=' + projectId + '&clean_text=description')
      delete groupData['vpermission']
      delete groupData['Contenttype']
      return JSON.parse(groupData);
    case 'statesData':
      return JSON.parse(getAuthenticatedValispaceUrl('requirements/states/?project=' + projectId));
    case 'tagsData':
      tagsData = getAuthenticatedValispaceUrl('tag/')
      delete tagsData['temporary']
      return JSON.parse(tagsData);
    case 'filesData':
      filesData = getAuthenticatedValispaceUrl('files/?project=' + projectId)
      delete filesData['preview_ready']
      return JSON.parse(filesData);
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


function getTextToInsert(all_data, object, property, projectId){
  
  property = property=='rationale'?'comment':property;

  //Special patch to get vm_methods
  vm_methods = null
  if(property=='vm-methods'){
    vm_methods = JSON.parse(getAuthenticatedValispaceUrl('requirements/requirement-vms/?project=' + projectId))
  }

  substitution = {
    'owner': [getUserFrom, [object[property], all_data['users'], all_data['user_groups']]],
    'tags': [replaceAttributesWithId, ['tags', all_data['tags'], object, 'name']],
    'section':[replaceAttributesWithId, ['group', all_data['groups'], object, 'name']],
    'parents':[replaceAttributesWithId, ['parents', all_data['requirements'], object, 'identifier']],
    'children':[replaceAttributesWithId, ['children', all_data['requirements'], object, 'identifier']],
    'files': [getFilesInRequirement, [all_data['files'], object]],
    'images': [getImagesinFilesInRequirement, [all_data['files'], object]],
    'vm-methods':[replaceAttributesWithId, ['verification_methods', vm_methods, object, 'method']]
  }
  
 
  text_to_insert = '';
  if(substitution.hasOwnProperty(property)){
    var func, args

    [func, args] = substitution[property];


    text_to_insert = func.apply( this, args );
  }
  else if (object.hasOwnProperty(property)) {
    text_to_insert = object[property] ? object[property] : '-';
  }

  return text_to_insert;
}


function direct_insert(all_data, objectName, property, new_line=false){
  var insertion_type = property == 'images' ? 'image' : 'text';
  var parentType = objectName.split("_")[0].toString();
  var parentId = parseInt(objectName.split("_")[1]);

  var base_path = PropertiesService.getUserProperties().getProperty('deployment_url')

  var object = all_data[types[parentType].name].find(x => x['id'] === parentId);
  var url_meta = urlTranslator(object, types[parentType], base_path);

  projectId = PropertiesService.getUserProperties().getProperty('projectID');
  var text_to_insert = getTextToInsert(all_data, object, property, projectId);

  var insertion_data = new InsertionData(
    text_to_insert,
    url_meta,
    objectName,
    property
  );
  return Inserter.insert(insertion_data, insertion_type, new_line);
}


// function direct_insert(objectList, objectName, property) {
//   specificationsData = objectList['specifications']
//   labelsData = objectList['labels']
//   requirementsData = objectList['requirements']
//   groupsData = objectList['groups']
//   statesData = objectList['states']
//   tagsData = objectList['tags']
//   filesData = objectList['files']
//   usersData = objectList['users']
//   user_groupsData = objectList['user_groups']
//   var id = objectName.split("_");
//   var parentType = id[0].toString();
//   var parentId = parseInt(id[1]);
//   // console.log(parentType, parentId)
//   requirements = requirementsData

//   var object = objectList[types[parentType].name].find(x => x['id'] === parentId);

//   var base_path = PropertiesService.getUserProperties().getProperty('deployment_url')
//   var url_meta = urlTranslator(object, types[parentType], base_path);
//   var insertion_type = 'text';
//   text_to_insert = '-';
//   if (object[property]) {
//     text_to_insert = object[property];
//   }
//   if (property == 'owner') {
//     text_to_insert = getUserFrom(object[property], usersData, user_groupsData);
//   }
//   if (property == 'tags') {
//     text_to_insert = replaceAttributesWithId('tags', tagsData, requirements, parentId, 'name')
//   }
//   // Replacing Group (Section) Name
//   else if (property == 'section') {
//     text_to_insert = replaceAttributesWithId('group', groupsData, requirements, parentId, 'name')
//   }
//   // Replacing Parent Name
//   else if (property == 'parents') {
//     //            textToInsert = replaceParents(requirements, req, 'identifier')
//     text_to_insert = replaceAttributesWithId('parents', requirementsData, requirements, parentId, 'identifier')
//   }
//   // Replacing Children Name
//   else if (property == 'children') {
//     //            textToInsert = replaceParents(requirements, req, 'identifier')
//     text_to_insert = replaceAttributesWithId('children', requirementsData, requirements, parentId, 'identifier')
//   }
//   // Replacing Files Names
//   else if (property == 'files') {
//     reqId = parentId
//     text_to_insert = getFilesInRequirement(filesData, reqId)
//   }
//   if (property == 'images') {
//     text_to_insert = getImagesinFilesInRequirement(filesData, parentId);
//     insertion_type = 'image';
//   }
//   if(!text_to_insert || text_to_insert == " "){ text_to_insert = '-'}
//   var insertion_data = new InsertionData(
//     text_to_insert,
//     url_meta,
//     objectName,
//     property
//   );
//   Inserter.insert(insertion_data, insertion_type);
// }

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


function insertRequirementsWithSpecGroups_asTable_fromTemplate(insertion_array, all_data){
  CacheService.getScriptCache().remove('templateTableData')
  CacheService.getScriptCache().remove('templateTableCellAttributes')
  now = new Date().getTime();
  var projectId = PropertiesCache('User', 'projectID')

  numOfCells = 0
  var reqs = []
  insertion_array.reverse();

  // console.log(insertion_array)

  for(line of insertion_array){
    // console.log(line)
    if(Array.isArray(line)){
      last_index = direct_insert(all_data, line[0], line[1], true);
      if(reqs.length>0){
        reqs.reverse();
        [tableIndex, tableIndex_, numOfCells] = insertRequirementsInSpec_asTable_fromTemplate(projectId, reqs, all_data, null, true, numOfCells);
        // console.log(index_and_element)
        // var txtOff=doc.getCursor().getOffset();
        reqs = []
      }
      // console.log(line[0])
      // var txtEl=doc.getCursor().getElement();
      // var txtOff=doc.getCursor().getOffset();
      // console.log
      // var pos=doc.newPosition(txtEl, txtOff + 1);
      // doc.setCursor(pos);
    }
    else{
      // console.log(line.identifier)
      reqs.push(line);
    }
  }

  if(reqs.length>0){
    [tableIndex, tableIndex_, numOfCells] = insertRequirementsInSpec_asTable_fromTemplate(projectId, reqs, all_data, null, true, numOfCells);
    reqs = []
  }

  CacheService.getScriptCache().remove('templateTableData')
  CacheService.getScriptCache().remove('templateTableCellAttributes')

  console.log(new Date().getTime()-now);
}


function insertRequirementsInSpec_asTable_fromTemplate(projectId, requirements, all_data, previousTableIndex = null, individual_tables=false, numOfCells = 0) {
  
  var individual_tables_setting = PropertiesCache('Document', 'IndividualInsertion')
  var base_path = PropertiesCache('User', 'deployment_url')

  if(individual_tables==false){
    individual_tables = individual_tables_setting;
  }

  specificationsData = all_data['specifications']
  labelsData = all_data['labels']
  requirementsData = all_data['requirements']
  groupsData = all_data['groups']
  statesData = all_data['states']
  tagsData = all_data['tags']
  filesData = all_data['files']
  usersData = all_data['users']
  user_groupsData = all_data['user_groups']



  var cache = CacheService.getScriptCache();
  if (cache.get('templateTableCellAttributes') == null || cache.get('templateTableData') == null) {
    documentId = PropertiesService.getDocumentProperties().getProperty('TemplateDocumentId')
    values = getTemplateTable2(documentId)
    templateTableData = values[0]
    templateTableCellAttributes = values[1]
    cache.put('templateTableData', JSON.stringify(templateTableData))
    cache.put('templateTableCellAttributes', JSON.stringify(templateTableCellAttributes))
  } else {
    templateTableData = JSON.parse(cache.get('templateTableData'))
    templateTableCellAttributes = JSON.parse(cache.get('templateTableCellAttributes'))
  }

  // This number limits the amount of cells that will be created and formated before closing and saving the requirement.
  // Smaller numbers saves more often but makes execution slower; Higher numbers stack too many changes before saving and returns and error
  // This number was "found empirically" and it needs to scale with the number of cells on the template table.
  cellLimit = 12000/(templateTableData.length*templateTableData[0].length)


  var table = []
  var tables = []
  var styleTableMapping = []
  var tables_styleTableMapping=[]
  var urlMapping = []
  var tables_urlMapping = []

  // TODO: insertHeader property as UserProperty and add option on Options
  var insertHeader = true

   
  for (req in requirements) {
    for (let rowIndex = 0; rowIndex < templateTableData.length; rowIndex++) {
      // Header

      if(insertHeader==true && rowIndex==0 && ((previousTableIndex == null && req==0) || individual_tables==true)){
        header = []
        headerStyle = []
        headerUrl = []

        for (let cellIndex = 0; cellIndex < templateTableData[0].length; cellIndex++) {
          header.push(templateTableData[rowIndex][cellIndex])
          headerStyle.push([[rowIndex], [cellIndex]])
          headerUrl.push([])
        }
        table.push(header)
        styleTableMapping.push(headerStyle)
        urlMapping.push(headerUrl)
      }
        if(rowIndex>0){
          subTableRow = []
          subTableStyleRow = []
          subUrlMapping = []
          for (let cellIndex = 0; cellIndex < templateTableData[rowIndex].length; cellIndex++) {
            // cellValue = templateTableData[rowIndex][cellIndex]
            cellText = templateTableData[rowIndex][cellIndex]

            //NEW MATCHING VIA REGEX SUBSTITUTION
            const prop_regex = /\$\w+/gm;
            text_to_insert = cellText
            text_to_insert = cellText.replace(prop_regex, match => getTextToInsert(all_data, requirements[req], match.substring(1), projectId));
            
            cellText = cellText.trim();
            subTableRow.push(text_to_insert)
            if (text_to_insert!= cellText){
              subUrlMapping.push(urlTranslator(requirements[req], types['requirements'], base_path) + `${VALI_PARAMETER_STR}requirements_${requirements[req].id}__${cellText.replace('$', '')}`);
            }
            else{
              subUrlMapping.push([])
            }

            subTableStyleRow.push([[rowIndex], [cellIndex]])

          }
          table.push(subTableRow)
          styleTableMapping.push(subTableStyleRow)
          urlMapping.push(subUrlMapping)
        }
      }
    if(individual_tables){
      tables.push(table)
      tables_styleTableMapping.push(styleTableMapping)
      tables_urlMapping.push(urlMapping)
      table = []
      styleTableMapping=[]
      urlMapping = []
    }
  }


  if (!individual_tables){
      tables.push(table)
      tables_styleTableMapping.push(styleTableMapping)
      tables_urlMapping.push(urlMapping)
  }

  // console.log(tables_styleTableMapping)
  // console.log(tables_urlMapping)
  // console.log(tables_styleTableMapping[0].length)
  // console.log(tables_styleTableMapping[0][0].length)
  

  // Inserting Tables
  for(i in tables){
    table = tables[i];
    styleTableMapping = tables_styleTableMapping[i];
    urlMapping = tables_urlMapping[i];
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
    var paragraph = body.insertParagraph(indexCursor, "")
    var tableIndex = body.getChildIndex(docTable)

    // var tableIndex = body.getChildIndex(docTable)
    // doc.saveAndClose()
    
    // Formating Table
    tableLength = docTable.getNumRows()
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
      findAndReplaceImages(docTable)

      for (row = 0; row < docTable.getNumRows(); row++) {
        numOfCells += docTable.getRow(row).getNumCells();
      }

      // Logger.log(numOfCells)
      if (numOfCells > cellLimit){
        doc.saveAndClose()
        numOfCells = 0
      }

      previousTableIndex = tableIndex;

    }


    // TODO: Put this Function inside the Loop and work with cell, instead of entire table
    var doc = DocumentApp.getActiveDocument();
    var body = doc.getBody();
    var docTable = body.getChild(tableIndex)
    findAndReplaceImages(docTable)
    // var pos=doc.newPosition(docTable.getNextSibling(), 1);
    // doc.setCursor(pos);
    
  }

  // doc.saveAndClose()
  return [tableIndex, DocumentApp.getActiveDocument().getChild(tableIndex), numOfCells]
  // return [table, styleTableMapping]
}

function PropertiesCache(local, propertyName){
  cache = CacheService.getScriptCache()

  if (cache.get(propertyName) == null){
    if (local == "Document"){
      property = PropertiesService.getDocumentProperties().getProperty(propertyName)
      cache.put(propertyName, property)
    } else if (local == "User"){
      property = PropertiesService.getUserProperties().getProperty(propertyName)
      cache.put(propertyName, property)
    } else {
      console.log('Error: Use either Document or User Properties')
    }
  } else {
    if (local == "Document"){
      property = cache.get(propertyName)
    } else if (local == "User"){
      property = cache.get(propertyName)
    } else {
      console.log('Error: Use either Document or User Properties')
    }
  }
  return property
}

function getUserFrom(origin, usersData, user_groupsData) {
  if (origin == null){
    return "-"
  }
  text = '-'
  if (origin.contenttype == 5) {
    user = usersData.find(x => x['id'] === origin.id)
    if (user.first_name || user.last_name) {
      text = user.first_name + ' ' + user.last_name
    } else {
      text = user.username
    }
  }
  else if (origin.contenttype == 4) {
    group = user_groupsData.find(x => x['id'] === origin.id)
    if (group.name) {
      text = group.name
    }
  }
  return text
}

function replaceAttributesWithId(attribute, objectsList, objectToSearch, attributeToInsert) {
  if (objectToSearch[attribute] == null | !objectToSearch[attribute].length) {
    return '-';
  }
  objectsIds = objectToSearch[attribute];
    objectsIds = Array.isArray(objectsIds) ? objectsIds : [objectsIds];
    objectAttributes = objectsIds.map(objectId=>objectsList.find(x => x['id'] === objectId)[attributeToInsert]);
    if (objectAttributes){
      return objectAttributes.join(',');
    }
    else{
      return '-';
    }
}

function getFilesInRequirement(filesList, requirement) {

  textToInsert = ''
  var filesOnReq = filesList.filter(x => x['object_id'] === requirement['id'])


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

function getImagesinFilesInRequirement(filesList, requirement) {
  textToInsert = ''
  var filesOnReq = filesList.filter(x => x['object_id'] === requirement['id'] && x['mimetype'] !== null && x['mimetype'].includes("image/"))
  
  for (fileIndex in filesOnReq) {
    var imageURL = filesOnReq[fileIndex]['download_url']
    textToInsert += '$START_IMG_META=' +
      '$START_IMG_ID=files_' + filesOnReq[fileIndex]['id'] + '$END_IMG_ID' +
      '$START_IMG_URL=' + imageURL + '$END_IMG_URL' +
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
      maxWidth = 500
      maxHeight = 500
      if (img.getWidth()>maxWidth | img.getHeight()>maxHeight){
        console.log("Rescale Image")
        ratio = maxWidth/img.getWidth()
        img.setWidth(img.getWidth()*ratio)
        img.setHeight(img.getHeight()*ratio)
        // TODO: 
      }


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

      
      // TODO: There might be a better way of doing this. This is needed because the Caching of the cellAtributes doesn't return the object of documentApp.alignment
      if ('VERTICAL_ALIGNMENT' in styleCellAttributes){
        if (styleCellAttributes['VERTICAL_ALIGNMENT']=="TOP"){
          styleCellAttributes['VERTICAL_ALIGNMENT'] = DocumentApp.VerticalAlignment.TOP  
        }
        else if (styleCellAttributes['VERTICAL_ALIGNMENT']=="CENTER"){
          styleCellAttributes['VERTICAL_ALIGNMENT'] = DocumentApp.VerticalAlignment.CENTER  
        }
        else if (styleCellAttributes['VERTICAL_ALIGNMENT']=="BOTTOM"){
          styleCellAttributes['VERTICAL_ALIGNMENT'] = DocumentApp.VerticalAlignment.BOTTOM  
        }
      }

      if ('HORIZONTAL_ALIGNMENT' in styleCellAttributes){
        if (styleCellAttributes['HORIZONTAL_ALIGNMENT']=="TOP"){
          styleCellAttributes['HORIZONTAL_ALIGNMENT'] = DocumentApp.HorizontalAlignment.TOP  
        }
        else if (styleCellAttributes['HORIZONTAL_ALIGNMENT']=="CENTER"){
          styleCellAttributes['HORIZONTAL_ALIGNMENT'] = DocumentApp.HorizontalAlignment.CENTER  
        }
        else if (styleCellAttributes['VERTICAL_ALIGNMENT']=="BOTTOM"){
          styleCellAttributes['HORIZONTAL_ALIGNMENT'] = DocumentApp.HorizontalAlignment.BOTTOM  
        }
      }

      if ('TEXT_ALIGNMENT' in styleCellAttributes){
        if (styleCellAttributes['TEXT_ALIGNMENT']=="NORMAL"){
          styleCellAttributes['TEXT_ALIGNMENT'] = DocumentApp.TextAlignment.NORMAL  
        }
        else if (styleCellAttributes['TEXT_ALIGNMENT']=="SUPERSCRIPT"){
          styleCellAttributes['TEXT_ALIGNMENT'] = DocumentApp.TextAlignment.SUPERSCRIPT  
        }
        else if (styleCellAttributes['TEXT_ALIGNMENT']=="SUBSCRIPT"){
          styleCellAttributes['TEXT_ALIGNMENT'] = DocumentApp.TextAlignment.SUBSCRIPT  
        }
      }

      delete styleCellAttributes[DocumentApp.Attribute.LINK_URL]
      table.getCell(rowIndex, columnIndex).setLinkUrl(urlMapping[rowIndex][columnIndex])
      table.getCell(rowIndex, columnIndex).setAttributes(styleCellAttributes)


    }
    if (counter > cellLimit) {
      return rowIndex
    }
  }
}
