function insert_files_using_template(insertion_array, all_data) {
  CacheService.getScriptCache().remove('templateTableData');
  CacheService.getScriptCache().remove('templateTableCellAttributes');
  var projectId = PropertiesCache('User', 'projectID');

  numOfCells = 0;
  var files = [];
  insertion_array.reverse();


  for (line of insertion_array) {


    // If this is a Group
    if (Array.isArray(line)) {

      // Add Folder or Section Name Name
      last_index = files_direct_insert(all_data, line[0], line[1], true);

      if (files.length > 0) {
        files.reverse();
        [tableIndex, tableIndex_, numOfCells] = insertFiles_asTable_fromTemplate(projectId, files, all_data, null, numOfCells);
        files = [];
      }
    }
    else {
      files.push(line);
    }
  }

  // Insert Single File
  if (files.length > 0) {

    [tableIndex, tableIndex_, numOfCells] = insertFiles_asTable_fromTemplate(projectId, files, all_data, null, numOfCells);
    files = []
  }


  CacheService.getScriptCache().remove('templateTableData')
  CacheService.getScriptCache().remove('templateTableCellAttributes')

}

function files_direct_insert(all_data, objectName, property, new_line = false) {

  var insertion_type = property == 'images' ? 'image' : 'text';
  var parentType = objectName.split("_")[0].toString();
  var parentId = parseInt(objectName.split("_")[1]);

  var base_path = PropertiesService.getUserProperties().getProperty('deployment_url');

  var object = all_data[types[parentType].name].find(x => x['id'] === parentId);
  //var url_meta = urlTranslator(object, types[parentType], base_path);

  projectId = PropertiesService.getUserProperties().getProperty('projectID');
  var text_to_insert = getFilesTextToInsert(all_data, object, property, projectId);


  var insertion_data = new InsertionData(
    text_to_insert,
    objectName,
    property
  );
  return Inserter.insert(insertion_data, insertion_type, new_line);
}

function files_replaceAttributesWithId(attribute, objectsList, objectToSearch, attributeToInsert) {

  if (objectToSearch[attribute] === null) {
    return '0';
  }
  objectId = objectToSearch[attribute];
  objectAttributes = objectsList.find(x => x['id'] === objectId)[attributeToInsert];
  if (objectAttributes) {
    return objectAttributes
  }
  else {
    return '0';
  }
}

function files_replaceReferencesWithObject(attribute, objectList, objectToSearch) {
  let content_types = [
    {
      'id': 21,
      'url': 'components/',
      'property': 'name'
    },
    {
      'id': 120,
      'url': 'requirements/',
      'property': 'identifier'
    },
    {
      'id': 38,
      'url': 'valis/',
      'property': '?'
    },
    {
      'id': 13,
      'url': 'project/',
      'property': 'name'
    }
  ]

  //reference_files = objectList.filter(x => x['file_type'] == 3);
  referenced_files = objectList.filter(x => x['reference_file'] == objectToSearch['id']);

  referenced_files.push(objectToSearch);

  reference_objects = '';
  referenced_files.forEach(function (file) {
    if (file[attribute] == null) {
      reference_objects = reference_objects + ' ';
    } else {
      object_id = file[attribute];
      request_url = content_types.find(x => x['id'] == file['content_type'])['url'];
      request_url = request_url + object_id + '/';
      object = JSON.parse(getAuthenticatedValispaceUrl(request_url));
      reference = object[content_types.find(x => x['id'] == file['content_type'])['property']]
      if (reference_objects.length == 0) {
        reference_objects = reference_objects + reference;
      } else {
        reference_objects = reference_objects + ', ' + reference
      }
    }
  });

  if (reference_objects) {
    return reference_objects;
  }
}

function getFilesTextToInsert(all_data, object, property, projectId) {

  property = property == 'rationale' ? 'comment' : property;
  substitution = {
    'files': [getFilesInFolder, [all_data['files'], object]],
    'current_version': [files_replaceAttributesWithId, ['current_version', all_data['versions'], object, 'version']],
    'object_id': [files_replaceReferencesWithObject, ['object_id', all_data['files'], object]]
  }

  text_to_insert = '';
  if (substitution.hasOwnProperty(property)) {
    var func, args

    [func, args] = substitution[property];


    text_to_insert = func.apply(this, args);

  } else if (object.hasOwnProperty(property)) {
    text_to_insert = object[property] ? object[property] : '-';
  }

  return text_to_insert;
}

function getFilesInFolder(filesList, folder) {

  textToInsert = ''
  var files = filesList.filter(x => x['folder'] === folder['id'])


  for (fileIndex in files) {

    if (files[fileIndex]['file_type'] === 1) {
      textToInsert += files[fileIndex]['name'] + ", "
    } else if (files[fileIndex]['file_type'] === 2) {
      textToInsert += files[fileIndex]['name'] + ", "
    }
  }
  return textToInsert
}

// TODO: Why are the functions insertRequirementsInSpec_asTable_fromTemplate and insert_spec_or_group_using_template separated? There is no clear distinction/
function insertFiles_asTable_fromTemplate(projectId, files, all_data, previousTableIndex = null, numOfCells = 0) {
  var base_path = PropertiesCache('User', 'deployment_url')

  fileFodersData = all_data['fileFolders']
  filesData = all_data['files']
  versionsData = all_data['versions']
  usersData = all_data['users']
  user_groupsData = all_data['user_groups']

  individual_tables = true;

  var cache = CacheService.getScriptCache();
  if (cache.get('templateTableCellAttributes') == null || cache.get('templateTableData') == null) {
    documentId = PropertiesService.getDocumentProperties().getProperty('TemplateDocumentId')
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


  for (file in files) {
    for (let rowIndex = 0; rowIndex < templateTableData.length; rowIndex++) {
      // Header

      if (insertHeader == true && rowIndex == 0 && ((previousTableIndex == null && file == 0) || individual_tables == true)) {
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
          text_to_insert = cellText.replace(prop_regex, match => getFilesTextToInsert(all_data, files[file], match.substring(1), projectId));

          cellText = cellText.trim();
          subTableRow.push(text_to_insert)
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
    };

    if (!individual_tables) {
      tables.push(table);
      tables_styleTableMapping.push(styleTableMapping);
      tables_urlMapping.push(urlMapping);
    };

  }


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

  }

  return [tableIndex, DocumentApp.getActiveDocument().getChild(tableIndex), numOfCells]
}