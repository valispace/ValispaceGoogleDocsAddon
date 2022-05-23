//TODO: Replace all the getAuthenticatedValispaceUrl with the API functions (like requirementsData)

function get_data(projectId, dataType) {
  switch (dataType) {
    case 'foldersData':
      return JSON.parse(getAuthenticatedValispaceUrl('requirements/specifications/folders/?project=' + projectId));
    case 'specificationsData':
      specificationData = getAuthenticatedValispaceUrl('requirements/specifications/full_list/?project=' + projectId + '&clean_text=description')
      delete specificationData['vpermission']
      delete specificationData['Contenttype']
      return JSON.parse(specificationData);
    case 'requirementsData':
      requirementsData = types.requirements.get(projectId)
      return requirementsData;
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
    case 'fileFoldersData':
      return JSON.parse(getAuthenticatedValispaceUrl('files/folders/?project=' + projectId));
    case 'versionsData':
      return JSON.parse(getAuthenticatedValispaceUrl('files/versions/?project='+projectId));
  }
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

function getTextToInsert(all_data, object, property, projectId) {

  property = property == 'rationale' ? 'comment' : property;

  //Special patch to get vm_methods
  vm_methods = null
  if (property == 'vm-methods') {
    //TODO: Pass to API call
    vm_methods = JSON.parse(getAuthenticatedValispaceUrl('requirements/requirement-vms/?project=' + projectId))
  }

  substitution = {
    'owner': [getUserFrom, [object[property], all_data['users'], all_data['user_groups']]],
    'tags': [replaceAttributesWithId, ['tags', all_data['tags'], object, 'name']],
    'section': [replaceAttributesWithId, ['group', all_data['groups'], object, 'name']],
    'parents': [replaceAttributesWithId, ['parents', all_data['requirements'], object, 'identifier']],
    'children': [replaceAttributesWithId, ['children', all_data['requirements'], object, 'identifier']],
    'files': [getFilesInRequirement, [all_data['files'], object]],
    'images': [getImagesinFilesInRequirement, [all_data['files'], object]],
    'vm-methods': [replaceAttributesWithId, ['verification_methods', vm_methods, object, 'method']]
  }


  text_to_insert = '';
  if (substitution.hasOwnProperty(property)) {
    var func, args

    [func, args] = substitution[property];


    text_to_insert = func.apply(this, args);
  }
  else if (object.hasOwnProperty(property)) {
    text_to_insert = object[property] ? object[property] : '-';
  }
  else if (!object.hasOwnProperty(property)) {
    text_to_insert = '-'
  }

  return text_to_insert;
}

function direct_insert(all_data, objectName, property, new_line = false) {
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

  var append = false;
  if (parentType == "requirements") {
    append = true
  }
  return Inserter.insert(insertion_data, insertion_type, new_line, append);
}

function getTemplateTable(documentId) {
  templateTableData = []
  templateTableCellAttributes = []

  var body = DocumentApp.openById(documentId).getBody()
  table = body.getTables()[0]

  numColumns = table.getRow(0).getNumCells()
  for (let rowIndex = 0; rowIndex < table.getNumRows(); rowIndex++) {
    rowData = []
    rowCellAttributes = []

    for (let columnIndex = 0; columnIndex < numColumns; columnIndex++) {
      rowData.push(table.getCell(rowIndex, columnIndex).getText())
      rowCellAttributes.push(table.getCell(rowIndex, columnIndex).getAttributes())
    }
    templateTableData.push(rowData)
    templateTableCellAttributes.push(rowCellAttributes)
  }

  return [templateTableData, templateTableCellAttributes]
}

function insert_spec_or_group_using_template(insertion_array, all_data) {
  CacheService.getScriptCache().remove('templateTableData');
  CacheService.getScriptCache().remove('templateTableCellAttributes');
  var projectId = PropertiesCache('User', 'projectID');

  numOfCells = 0;
  var reqs = [];
  // Check if after inserting a section/group we have inserted requirements
  var req_inserted = false;
  var section_inserted = false;
  insertion_array.reverse();
  for (line of insertion_array) {
    // If this is a Group
    if (Array.isArray(line)) {
       if(section_inserted && !req_inserted){
         text_to_insert = "No requirements in section";
         var body = DocumentApp.getActiveDocument().getBody();
         var cursor = DocumentApp.getActiveDocument().getCursor();
         var indexCursor = getCursorIndex(body, cursor);
         var paragraph = body.insertParagraph(indexCursor + 1, text_to_insert);
       }
      // Add Specification or Section Name Name
      last_index = direct_insert(all_data, line[0], line[1], true);
      if (reqs.length > 0){
        reqs.reverse();
        [tableIndex, tableIndex_, numOfCells] = insertRequirementsInSpec_asTable_fromTemplate(projectId, reqs, all_data, null, numOfCells);
        reqs = [];
        req_inserted = true;
      }
      section_inserted = true;
      req_inserted = false;
    }
    else {
      reqs.push(line);
    }
  }

  // Insert Single Requirement
  [tableIndex, tableIndex_, numOfCells] = insertRequirementsInSpec_asTable_fromTemplate(projectId, reqs, all_data, null, numOfCells);
  reqs = []


  CacheService.getScriptCache().remove('templateTableData')
  CacheService.getScriptCache().remove('templateTableCellAttributes')

}

// TODO: Why are the functions insertRequirementsInSpec_asTable_fromTemplate and insert_spec_or_group_using_template separated? There is no clear distinction/
function insertRequirementsInSpec_asTable_fromTemplate(projectId, requirements, all_data, previousTableIndex = null, numOfCells = 0) {
  var base_path = PropertiesCache('User', 'deployment_url')

  specificationsData = all_data['specifications']
  foldersData = all_data['folder']
  requirementsData = all_data['requirements']
  groupsData = all_data['groups']
  statesData = all_data['states']
  tagsData = all_data['tags']
  filesData = all_data['files']
  usersData = all_data['users']
  user_groupsData = all_data['user_groups']

  // Checking if individual_tables is set to true
  individual_tables_property = PropertiesService.getDocumentProperties().getProperty('individual_tables');
  // Extra step because Properties are stored as type string, evaluating to boolean
  individual_tables = (individual_tables_property === 'true')

  var cache = CacheService.getScriptCache();
  if (cache.get('templateTableCellAttributes') == null || cache.get('templateTableData') == null) {
    documentId = PropertiesService.getDocumentProperties().getProperty('TemplateDocumentId_requirements')
    values = getTemplateTable(documentId)
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
  cellLimit = 12000 / (templateTableData.length * templateTableData[0].length)


  var table = []
  var tables = []
  var styleTableMapping = []
  var tables_styleTableMapping = []
  var urlMapping = []
  var tables_urlMapping = []

  // TODO: insertHeader property as UserProperty and add option on Options
  var insertHeader = true


  for (req in requirements) {
    for (let rowIndex = 0; rowIndex < templateTableData.length; rowIndex++) {
      // Header

      if (insertHeader == true && rowIndex == 0 && ((previousTableIndex == null && req == 0) || individual_tables === true)) {
        header = []
        headerStyle = []
        headerUrl = []

        for (let cellIndex = 0; cellIndex < templateTableData[0].length; cellIndex++) {
          header.push(templateTableData[rowIndex][cellIndex])
          headerStyle.push([[rowIndex], [cellIndex]])
          headerUrl.push({
            url: "",
            startoffset : 0,
            endoffset  : 0
          })
        }
        table.push(header)
        styleTableMapping.push(headerStyle)
        urlMapping.push(headerUrl)
      }
      if (rowIndex > 0) {
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
          urlObject = {
            url: "",
            startoffset : 0,
            endoffset  : 0
          }
          if (text_to_insert != cellText) {
            property = cellText.split('$')[1].trim().replace('$', '')
            urlObject.url = urlTranslator(requirements[req], types['requirements'], base_path) + `${VALI_PARAMETER_STR}requirements_${requirements[req].id}__${property}`
            //This is a test whaveergsfdgsfgr and this is after

            object = requirements[req][property]
            urlObject.startoffset = cellText.indexOf("$");

            if (object !== undefined) {urlObject.endoffset = urlObject.startoffset + object.length - 1};
            if (urlObject.endoffset < 0) {
              urlObject.endoffset = 0
            }
          }
          subUrlMapping.push(urlObject);
          subTableStyleRow.push([[rowIndex], [cellIndex]])

        }
        table.push(subTableRow)
        styleTableMapping.push(subTableStyleRow)
        urlMapping.push(subUrlMapping)
      }
    }
    if (individual_tables) {
      tables.push(table);
      tables_styleTableMapping.push(styleTableMapping);
      tables_urlMapping.push(urlMapping);
      table = [];
      styleTableMapping = [];
      urlMapping = [];
    }
  }

  if (!individual_tables) {
    tables.push(table);
    tables_styleTableMapping.push(styleTableMapping);
    tables_urlMapping.push(urlMapping);
  };

  // Inserting Tables
  for (i in tables) {
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


      rowIndex = formatingTable(docTable, styleTableMapping, urlMapping, templateTableCellAttributes, rowIndex, cellLimit)
      findAndReplaceImages(docTable)

      for (row = 0; row < docTable.getNumRows(); row++) {
        numOfCells += docTable.getRow(row).getNumCells();
      }

      if (numOfCells > cellLimit) {
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

  }

  return [tableIndex, DocumentApp.getActiveDocument().getChild(tableIndex), numOfCells]
}

function PropertiesCache(local, propertyName) {
  cache = CacheService.getScriptCache()

  if (cache.get(propertyName) == null) {
    if (local == "Document") {
      property = PropertiesService.getDocumentProperties().getProperty(propertyName)
      cache.put(propertyName, property)
    } else if (local == "User") {
      property = PropertiesService.getUserProperties().getProperty(propertyName)
      cache.put(propertyName, property)
    } else {
      console.log('Error: Use either Document or User Properties')
    }
  } else {
    if (local == "Document") {
      property = cache.get(propertyName)
    } else if (local == "User") {
      property = cache.get(propertyName)
    } else {
      console.log('Error: Use either Document or User Properties')
    }
  }
  return property
}

function getUserFrom(origin, usersData, user_groupsData) {
  if (origin == null) {
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
  objectAttributes = objectsIds.map(objectId => objectsList.find(x => x['id'] === objectId)[attributeToInsert]);
  if (objectAttributes) {
    return objectAttributes.join(',');
  }
  else {
    return '-';
  }
}

function getFilesInRequirement(filesList, requirement) {

  textToInsert = ''
  var filesOnReq = filesList.filter(x => x['object_id'] === requirement['id'])

  for (fileIndex in filesOnReq) {
    if (filesOnReq[fileIndex]['file_type'] === 1) {
      textToInsert += filesOnReq[fileIndex]['name'] + "\n"
    } else if (filesOnReq[fileIndex]['file_type'] === 2) {
      textToInsert += filesOnReq[fileIndex]['name'] + "\n"
    } else if (filesOnReq[fileIndex]['file_type'] === 3) {
      referenceFileId = filesOnReq[fileIndex]['reference_file']
      originalFileId = filesList.find(x => x['id'] === referenceFileId)
      textToInsert += originalFileId['name'] + "\n"
    }

  }
  return textToInsert
}

function getImagesinFilesInRequirement(filesList, requirement) {
  textToInsert = ''
  var filesOnReq = filesList.filter(x => x['object_id'] === requirement['id'] && x['mimetype'] !== null && x['mimetype'].includes("image/"))
  if (filesOnReq.length !== 0) {
    for (fileIndex in filesOnReq) {
      file = filesOnReq[fileIndex]
      textToInsert += generateFileURL(file)
    }
  } else {
    textToInsert = '-'
  }


  return textToInsert
}

function generateFileURL(file) {
  var imageURL = file['download_url']
  text = '$START_IMG_META=' +
    '$START_IMG_ID=files_' + file['id'] + '$END_IMG_ID' +
    '$START_IMG_URL=' + imageURL + '$END_IMG_URL' +
    '$END_IMG_META'
  return text
}

function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function replaceImagesURLToFile(element) {
  var doc = DocumentApp.getActiveDocument();
  var text = element.getText()
  var meta_url_base = element.getLinkUrl().split('name=requirements')[0]
  var image_metas = text.split('$END_IMG_META')

  for (index in image_metas) {
    var meta = image_metas[index]
    if (meta.includes('$START_IMG_URL')) {

      url = meta.split('$START_IMG_URL=')[1].split('$END_IMG_URL')[0]
      meta_url = meta_url_base + 'name=' + meta.split('$START_IMG_ID=')[1].split('$END_IMG_ID')[0]

      var imgBlob = UrlFetchApp.fetch(url).getBlob();

      var searchText = image_metas[index] + '$END_IMG_META'
      searchText = escapeRegExp(searchText)

      var img = element.getParent().asParagraph().insertInlineImage(0, imgBlob);

      element.replaceText(searchText, '');
      img.setLinkUrl(meta_url)

      maxWidth = 500
      maxHeight = 500
      if (img.getWidth() > maxWidth | img.getHeight() > maxHeight) {
        ratio = maxWidth / img.getWidth()
        img.setWidth(img.getWidth() * ratio)
        img.setHeight(img.getHeight() * ratio)
      }

      let max_width = number(PropertiesService.getUserProperties().getProperty('max_image_width'));
      let max_height = number(PropertiesService.getUserProperties().getProperty('max_image_height'));
      let img_width = img.getWidth();
      let img_height = img.getHeight();

      let new_width = img_width;
      let new_height = img_height;

      if (!isNaN(max_width) && max_width > 0 && img_width > max_width) {
        new_width = max_width;
      }

      if (!isNaN(max_height) && max_height > 0 && img_height > max_height) {
        new_height = max_height;
      }

      let ws = new_width / img_width;
      let hs = new_height / img_height;
      let scale = ws > hs ? hs : ws;

      console.log("new size:", img_width * scale, img_height * scale);

      img.setWidth(img_width * scale);
      img.setHeight(img_height * scale);
    }
  }
}

function findAndReplaceImages(origin) {
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

function formatingTable(table, styleTableMapping, urlMapping, templateTableCellAttributes, startingRow, cellLimit) {
  counter = 0

  numColumns = table.getRow(0).getNumCells()
  for (let rowIndex = startingRow; rowIndex < table.getNumRows(); rowIndex++) {
    for (let columnIndex = 0; columnIndex < numColumns; columnIndex++) {
      counter += 1
      cellStyleLocation = styleTableMapping[rowIndex][columnIndex]
      styleCellAttributes = templateTableCellAttributes[cellStyleLocation[0]][cellStyleLocation[1]]
      //      styleTextAttributes = templateTableTextAttributes[cellStyleLocation[0]][cellStyleLocation[1]]


      // TODO: There might be a better way of doing this. This is needed because the Caching of the cellAtributes doesn't return the object of documentApp.alignment
      if ('VERTICAL_ALIGNMENT' in styleCellAttributes) {
        if (styleCellAttributes['VERTICAL_ALIGNMENT'] == "TOP") {
          styleCellAttributes['VERTICAL_ALIGNMENT'] = DocumentApp.VerticalAlignment.TOP
        }
        else if (styleCellAttributes['VERTICAL_ALIGNMENT'] == "CENTER") {
          styleCellAttributes['VERTICAL_ALIGNMENT'] = DocumentApp.VerticalAlignment.CENTER
        }
        else if (styleCellAttributes['VERTICAL_ALIGNMENT'] == "BOTTOM") {
          styleCellAttributes['VERTICAL_ALIGNMENT'] = DocumentApp.VerticalAlignment.BOTTOM
        }
      }

      if ('HORIZONTAL_ALIGNMENT' in styleCellAttributes) {
        if (styleCellAttributes['HORIZONTAL_ALIGNMENT'] == "TOP") {
          styleCellAttributes['HORIZONTAL_ALIGNMENT'] = DocumentApp.HorizontalAlignment.TOP
        }
        else if (styleCellAttributes['HORIZONTAL_ALIGNMENT'] == "CENTER") {
          styleCellAttributes['HORIZONTAL_ALIGNMENT'] = DocumentApp.HorizontalAlignment.CENTER
        }
        else if (styleCellAttributes['VERTICAL_ALIGNMENT'] == "BOTTOM") {
          styleCellAttributes['HORIZONTAL_ALIGNMENT'] = DocumentApp.HorizontalAlignment.BOTTOM
        }
      }

      if ('TEXT_ALIGNMENT' in styleCellAttributes) {
        if (styleCellAttributes['TEXT_ALIGNMENT'] == "NORMAL") {
          styleCellAttributes['TEXT_ALIGNMENT'] = DocumentApp.TextAlignment.NORMAL
        }
        else if (styleCellAttributes['TEXT_ALIGNMENT'] == "SUPERSCRIPT") {
          styleCellAttributes['TEXT_ALIGNMENT'] = DocumentApp.TextAlignment.SUPERSCRIPT
        }
        else if (styleCellAttributes['TEXT_ALIGNMENT'] == "SUBSCRIPT") {
          styleCellAttributes['TEXT_ALIGNMENT'] = DocumentApp.TextAlignment.SUBSCRIPT
        }
      }

      delete styleCellAttributes[DocumentApp.Attribute.LINK_URL]
      startOffset = urlMapping[rowIndex][columnIndex].startoffset
      endOffset = urlMapping[rowIndex][columnIndex].endoffset
      //console.log(urlMapping)
      //console.log(table.getCell(rowIndex, columnIndex).getText());
      if(startOffset == 0 && endOffset == 0){
        table.getCell(rowIndex, columnIndex).editAsText().setLinkUrl(urlMapping[rowIndex][columnIndex].url)
      } else {
        table.getCell(rowIndex, columnIndex).editAsText().setLinkUrl(urlMapping[rowIndex][columnIndex].startoffset, urlMapping[rowIndex][columnIndex].endoffset , urlMapping[rowIndex][columnIndex].url)
      }

      table.getCell(rowIndex, columnIndex).setAttributes(styleCellAttributes)
    }
    if (counter > cellLimit) {
      return rowIndex
    }
  }
}
