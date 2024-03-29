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
  var url_meta = urlTranslator(object, types['files'], base_path);

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

  if (!objectToSearch.hasOwnProperty(attribute) || objectToSearch[attribute] === null) {
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
  let content_types_mapping = [
    {
      'model' : 'component',
      'url' : 'components/',
      'property' : 'name'
    },
    {
      'model': 'requirement',
      'url': 'requirements/',
      'property': 'identifier'
    },
    {
      'model': 'vali',
      'url': 'valis/',
      'property': 'name'
    },
    {
      'model' : 'testprocedure',
      'url' : 'testing/test-procedures/',
      'property' : 'name'
    },
    {
      'model' : 'testprocedurestep',
      'url' : 'testing/test-procedure-steps/',
      'property' : 'title'
    },
    {
      'model' : 'testrun',
      'url' : 'testing/test-runs/',
      'property' : 'name'
    },
    {
      'model' : 'project',
      'url' : 'project/',
      'property' : 'name'
    },
    {
      'model' : 'specification',
      'url' : 'requirements/specifications/',
      'property' : 'name'
    }
  ]

  content_types = JSON.parse(getAuthenticatedValispaceUrl('contenttypes/'))
  //reference_files = objectList.filter(x => x['file_type'] == 3);
  referenced_files = objectList.filter(x => x['reference_file'] == objectToSearch['id']);

  referenced_files.push(objectToSearch);

  reference_objects = '';
  referenced_files.forEach(function (file) {
    if (file[attribute] == null) {
      reference_objects = reference_objects + ' ';
    } else {
      object_id = file[attribute];
      object_type = content_types.find(x => x['id'] == file['content_type']);
      type_url = content_types_mapping.find(x => x['model'] == object_type['model'])['url']
      request_url = type_url + object_id +'/'
      object = JSON.parse(getAuthenticatedValispaceUrl(request_url));
      reference = object[content_types_mapping.find(x => x['model'] == object_type['model'])['property']]
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

  }
  else if (object.hasOwnProperty(property)) {
    text_to_insert = object[property] ? object[property] : '-';
  }
  else if (!object.hasOwnProperty(property)) {
    text_to_insert = '-';
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

  // Checking if individual_tables is set to true
  individual_tables_property = PropertiesService.getDocumentProperties().getProperty('individual_tables');
  // Extra step because Properties are stored as type string, evaluating to boolean
  individual_tables = (individual_tables_property === 'true')

  var cache = CacheService.getScriptCache();
  if (cache.get('templateTableCellAttributes') == null || cache.get('templateTableData') == null) {
    documentId = PropertiesService.getDocumentProperties().getProperty('TemplateDocumentId_files')
    values = getFilesTemplateTable(documentId)
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

      if (insertHeader == true && rowIndex == 0 && ((previousTableIndex == null && file == 0) || individual_tables === true)) {
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
          text_to_insert = cellText.replace(prop_regex, match => getFilesTextToInsert(all_data, files[file], match.substring(1), projectId));

          cellText = cellText.trim();
          subTableRow.push(text_to_insert)
          urlObject = {
            url: "",
            startoffset : 0,
            endoffset  : 0
          }
          if (text_to_insert != cellText) {
            property = cellText.split('$')[1].trim().replace('$', '')
            urlObject.url = urlTranslator(files[file], types['files'], base_path) + `${VALI_PARAMETER_STR}files_${files[file].id}`
            //This is a test whaveergsfdgsfgr and this is after

            object = files[file][property]
            urlObject.startoffset = cellText.indexOf("$");
            if (object !== undefined) {
              urlObject.endoffset = urlObject.startoffset + object.length - 1
            }

            if (typeof(object) == 'number') {
              urlObject.endoffset = urlObject.startoffset + text_to_insert.length - 1
            }
            if (urlObject.endoffset < 0 || urlObject.endoffset == NaN) {
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
    };
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

function getFilesTemplateTable(documentId) {
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