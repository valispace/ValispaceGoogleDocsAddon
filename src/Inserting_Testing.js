//displayableHTML
//dataStructure
//
//
//get folders
//get specs
//get sections
//
//
//go over folders
// create folder nodes
// 
//go over specs 
// create specs node and add on folders
// add to displayableHTML
// add to dataStructure
// 
//go over sections
// create section nodes
// add to displayableHTML
// add to dataStructure
//
//go over requirements
//  add to dataStructure
// 
//go over all nodes
// move inside parent node
// add to displayableHTML
// add to dataStructure
// 
// return html
// 
 


function temp_test123(){
  //  var userProperties = PropertiesService.getUserProperties();
  //  userProperties.deleteAllProperties();
    
    connect_temp123();
  //  Logger.log('Hello, i am here')
    var documentId = '1CMcbinhaL2pwuiCD1ODfrgYdgv5wnjZ9ym_AuzUU0wE';
    var doc = DocumentApp.openById(documentId);
    var body = doc.getBody();
    //  var body = DocumentApp.openById('1TG3LcHdOsswo4Vvl9V1rnloWrFUh1_qqmiRdFBNnazo').getBody();
    //var templatedoc = DocumentApp.openById('1bDQClCWVcvzPARYl5ohGvBgZlQ519NGGCStqizzK-bU');
    
    // - Staging - Airbus_testing2
  //  var project_id = 165
  //  var spec_id = 58971 // 2046 requirements
  //  var spec_id = 53812 // 10 requirements
    
    var project_id = 73
  //  var spec_id = 71558 // 3284 requirements
  //  var spec_id = 74843 // 99 requirements
    var spec_id = 59949 // 7 requirements
    var fullRequirements
    
    // Get Full List of Requirements
    // 3284 requirements in ~6 seconds
    // 99 requirements in ~ seconds
    // 3 requirements in ~ seconds
    // -------------------------
    fullRequirements = get_requirements(project_id)
  //  Logger.log(fullRequirements)
    // Order Requirements by Identifier - Doesn't add time!
    fullRequirements.sort(function(a,b){
      if(a.identifier == b.identifier)
        return 0;
      if(a.identifier < b.identifier)
        return -1;
      if(a.identifier > b.identifier)
        return 1;
    });
    // -------------------------
    
    // -------------------------
    // Add Requirements as text
    //  3284 requirements in ~6 seconds
    //  99  requirements in ~X seconds
    // -------------------------
    //  text = insertRequirementsInSpec(spec_id, fullRequirements, body)  
    //  body.appendParagraph(text)
    // -------------------------
    
    // -------------------------
    // Add Requirement as a Flat Table
    // 99 requirements in ~9 seconds as table
    // 3284 requirements in ~20 seconds as table
    // -------------------------
  //  table = insertRequirementsInSpec_asTable(spec_id, fullRequirements, body)
  //  Logger.log(table)
  //  var docTable = body.appendTable(table)
    // -------------------------
    
    // -------------------------
    // Formatting Table
    // Adding and Formating 99 requirements in <10s
    // Adding and Formating 3284 requirements in <40s
    // -------------------------
    //  formatingTable(docTable)
    // -------------------------
    
    // -------------------------
    // Insert Requirements as Template Table - Withouth Formating
    // 3284 requirements in ~46 seconds
    // 99 requirements in ~7 seconds
    // 3 requirements in ~ seconds
    // -------------------------
  //  templateTableData = getTemplateTable(documentId)
  //  table = insertRequirementsInSpec_asTable_fromTemplate(project_id, spec_id, fullRequirements, body, templateTableData)
  //  var docTable = body.appendTable(table)
    // -------------------------
    
    
    // -------------------------
    // Insert Requirements as Template Table - With Formating
    // 3284 requirements in ~66 seconds (withouth Tags) and ~ seconds (with a lot of Tags)
    // 99 requirements in ~ seconds
    // 3 requirements in ~7 seconds
    // -------------------------
    values = getTemplateTable2(documentId)
    templateTableData = values[0]
    templateTableCellAttributes = values[1]
    result = insertRequirementsInSpec_asTable_fromTemplate2(project_id, spec_id, fullRequirements, body, templateTableData)
    table = result[0]
    styleTableMapping = result[1]
    
    
    
    var docTable = body.appendTable(table)
    doc.saveAndClose()
    
    var doc = DocumentApp.openById(documentId);
    var body = doc.getBody()
    var docTable = body.getTables()[1] // This would be replaced by cursor position
    findAndReplaceImages(body, docTable)
    
    
    //  
    //  
    //  tableLength = docTable.getNumRows()
  //  cellLimit = 4000
  //  rowIndex = 0
  //  while (rowIndex < tableLength) {
  //    var doc = DocumentApp.openById(documentId);
  //    var body = doc.getBody()
  //    var docTable = body.getTables()[1] // This would be replaced by cursor position
  //    rowIndex = formatingTable3(docTable, styleTableMapping, templateTableCellAttributes, rowIndex, cellLimit) 
  //    doc.saveAndClose()
  //  }
    // -------------------------
  }
  
  
  
  // Generates a flatTable (matrix) with the replaceable fields
  // Could also save the atributes - See how to use it
  function getTemplateTable(documentId){
    templateTableData = []
    
    var body = DocumentApp.openById(documentId).getBody()
    table = body.getTables()[0]
    
    numColumns = table.getRow(0).getNumCells()
    for (let rowIndex=0; rowIndex < table.getNumRows(); rowIndex++){
      rowData = []
      rowAttributes = []
      for (let columnIndex=0; columnIndex < numColumns; columnIndex++){
        rowData.push(table.getCell(rowIndex, columnIndex).getText())
      }
      templateTableData.push(rowData)
    }
    
    //  return [templateTableData, templateTableAttributes]
    return templateTableData
  }
  
  function getTemplateTable2(documentId){
    templateTableData = []
    templateTableCellAttributes = []
    //  templateTableTextAttributes = []
    
    var body = DocumentApp.openById(documentId).getBody()
    table = body.getTables()[0]
    
    numColumns = table.getRow(0).getNumCells()
    for (let rowIndex=0; rowIndex < table.getNumRows(); rowIndex++){
      rowData = []
      rowCellAttributes = []
      //    rowTextAttributes = []
      
      for (let columnIndex=0; columnIndex < numColumns; columnIndex++){
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
  
  
  function insertRequirementsInSpec_asTable_fromTemplate(project_id, spec_id, requirements, body, templateTableData){
    var tagsList = get_tags()
    
    var table = []
    
    for (req in requirements){
      if (requirements[req]['specification'] === spec_id){
        for (let rowIndex=1;rowIndex<templateTableData.length;rowIndex++){
          subTableRow = []
          for (let cellIndex=0;cellIndex<templateTableData[rowIndex].length; cellIndex++){
            cellValue = templateTableData[rowIndex][cellIndex]
            if (cellValue.includes('$tags')){
              attribute = cellValue.replace('$','')
              tags = requirements[req][attribute]
              textToInsert = ''
              for (index in tags) {
                tagId = tags[index]
                var tag = tagsList.find(x => x['id'] === tagId)
                textToInsert += tag['name'] + ', '
              }
              subTableRow.push(textToInsert)
            } else if (cellValue.includes('$group')){
              attribute = cellValue.replace('$','')
              groupId = requirements[req][attribute]
              if (groupId != null){
                var group = groupList.find(x => x['id'] === groupId)
                subTableRow.push(group['name'])
              } else {
                subTableRow.push('')
              }
            }  else if (cellValue.includes('$')){
              attribute = cellValue.replace('$','')
              subTableRow.push(requirements[req][attribute].toString())
            } else{
              subTableRow.push(cellValue)
            }
          }
          table.push(subTableRow)
        }
      }  
    }
    return table
  }
  
  function insertRequirementsInSpec_asTable_fromTemplate2(project_id, spec_id, requirements, body, templateTableData){
    var tagsList = get_tags()
    var groupList = get_groups(project_id)
    var filesList = get_files(project_id)
    
    
    var table = []
    var styleTableMapping = []
    
    for (req in requirements){
      if (requirements[req]['specification'] === spec_id){
        for (let rowIndex=1;rowIndex<templateTableData.length;rowIndex++){
          subTableRow = []
          subTableStyleRow = []
          for (let cellIndex=0;cellIndex<templateTableData[rowIndex].length; cellIndex++){
            cellValue = templateTableData[rowIndex][cellIndex]
            // Replacing Tags (folder) Name
            if (cellValue.includes('$tags')){
              textToInsert = replaceAttributesWithId('tags', tagsList, requirements, req, 'name')
              subTableRow.push(textToInsert)
            } 
            // Replacing Group (Section) Name
            else if (cellValue.includes('$section')){
              textToInsert = replaceAttributesWithId('group', groupList, requirements, req, 'name')
              subTableRow.push(textToInsert)
            } 
            // Replacing Parent Name
            else if (cellValue.includes('$parents')){
  //            textToInsert = replaceParents(requirements, req, 'identifier')
              replaceAttributesWithId('parents', requirements, requirements, req, 'identifier')
              subTableRow.push(textToInsert)
            }
            // Replacing Files Names
            else if (cellValue.includes('$files')){
              reqId = requirements[req]['id']
              textToInsert = getFilesInRequirement(filesList, reqId, project_id)
              subTableRow.push(textToInsert)
            }
            // Replacing Images
            else if (cellValue.includes('$images')){
              reqId = requirements[req]['id']
              imgBlob = getImagesinFilesInRequirement(filesList, reqId)
              subTableRow.push(imgBlob)
            }
            // Replacing Other Attributes
            else if (cellValue.includes('$')){
              attribute = cellValue.replace('$','')
              subTableRow.push(requirements[req][attribute].toString())
            } else{
              subTableRow.push(cellValue)
            }
            subTableStyleRow.push([[rowIndex],[cellIndex]])
          }
          table.push(subTableRow)
          styleTableMapping.push(subTableStyleRow)
        }
      }  
    }
    
    return [table, styleTableMapping]
  }
  
  function replaceAttributesWithId(attribute, objectsList, requirementsList, req, attributeToInsert){
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
  
  
  function getFilesInRequirement(filesList, reqId, project_id){
    
    textToInsert = ''
    var filesOnReq = filesList.filter(x => x['object_id'] === reqId)
    
    
    for (fileIndex in filesOnReq) {
      
      if (filesOnReq[fileIndex]['file_type']===1){
        textToInsert += filesOnReq[fileIndex]['name'] + ", "
      } else if (filesOnReq[fileIndex]['file_type']===2){
        textToInsert += filesOnReq[fileIndex]['name'] + ", "
      } else if (filesOnReq[fileIndex]['file_type']===3){
        referenceFileId = filesOnReq[fileIndex]['reference_file']
        originalFileId = filesList.find(x => x['id'] === referenceFileId)
        textToInsert += originalFileId['name'] + ", "
      } 
      
    }
    return textToInsert
  }
  
  function getImagesinFilesInRequirement(filesList, reqId){
    
    textToInsert = ''
    var filesOnReq = filesList.filter(x => x['object_id'] === reqId & x['mimetype'] === "image/jpeg")
    
    for (fileIndex in filesOnReq) {
      var imageURL = filesOnReq[fileIndex]['download_url']
      textToInsert += '$START_IMG_URL='+imageURL+'$ENG_IMG_URL '
  //     
    }
    return textToInsert
  }
  
  function replaceImagesURLToFile(body, text){
    
    
    var image_urls = text.split('$ENG_IMG_URL')
    
    for (index in image_urls){
      var url = image_urls[index]
      if (url.includes('$START_IMG_URL')){
        
        url = url.split('$START_IMG_URL=')[1]
  //      Logger.log(url)
        
        var imgBlob = UrlFetchApp.fetch(url).getBlob();
        
        var searchText = '$START_IMG_URL='+url+'$ENG_IMG_URL'
        searchText = escapeRegExp(searchText)
        Logger.log(searchText)
        
        var element = body.findText(searchText);
        Logger.log(element)
        
        if (element != null){
          var textElement = element.getElement();
          var img = textElement.getParent().asParagraph().insertInlineImage(0, imgBlob);
          body.replaceText(searchText, '');
        }
      }
    }
  }
  
  function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }
  
  function findAndReplaceImages(body, table){
    
    for (let rowIndex=0; rowIndex < table.getNumRows(); rowIndex++){
      for (let columnIndex=0; columnIndex < numColumns; columnIndex++){
        cellContent = table.getCell(rowIndex, columnIndex).getText()
        if (cellContent.includes('$START_IMG_URL=')){
          replaceImagesURLToFile(body, cellContent)
        }
      }
    }
  }
  
  function formatingTable(table) {
    var headerStyle = {};  
    headerStyle[DocumentApp.Attribute.BACKGROUND_COLOR] = '#336600';  
    headerStyle[DocumentApp.Attribute.BOLD] = true;  
    headerStyle[DocumentApp.Attribute.FOREGROUND_COLOR] = '#FFFFFF';
    
    var identifierStyle = {};  
    identifierStyle[DocumentApp.Attribute.BOLD] = true;  
    
    
    numColumns = table.getRow(0).getNumCells()
    for (let rowIndex=0; rowIndex < table.getNumRows(); rowIndex++){
      for (let columnIndex=0; columnIndex < numColumns; columnIndex++){
        if (rowIndex===0){
          table.getCell(rowIndex, columnIndex).setAttributes(headerStyle)
        }
        if (columnIndex===0){
          table.getCell(rowIndex, columnIndex).setAttributes(identifierStyle);
        }
      }
      
    }
  }
  
  
  function formatingTable2(table, styleTableMapping, templateTableCellAttributes) {
    
    numColumns = table.getRow(0).getNumCells()
    for (let rowIndex=0; rowIndex < table.getNumRows(); rowIndex++){
      for (let columnIndex=0; columnIndex < numColumns; columnIndex++){
        
        cellStyleLocation = styleTableMapping[rowIndex][columnIndex]
        styleCellAttributes = templateTableCellAttributes[cellStyleLocation[0]][cellStyleLocation[1]]
        //      styleTextAttributes = templateTableTextAttributes[cellStyleLocation[0]][cellStyleLocation[1]]
        
        styleCell = {};
        for (attributeName in styleCellAttributes){
          if (styleCellAttributes[attributeName] != null && styleCellAttributes[attributeName] != ""){
            styleCell[DocumentApp.Attribute[attributeName]] = styleCellAttributes[attributeName]
          }
        }
        
        table.getCell(rowIndex, columnIndex).setAttributes(styleCell)
        
      }
      
    }
  }
  
  // Save and Close
  // Not Finished. - Proposal, get cursor -> get table after, then continue.
  function formatingTable3(table, styleTableMapping, templateTableCellAttributes, startingRow, cellLimit) {
    counter = 0
    
  //  Logger.log(startingRow)
    
    numColumns = table.getRow(0).getNumCells()
    for (let rowIndex=startingRow; rowIndex < table.getNumRows(); rowIndex++){
      for (let columnIndex=0; columnIndex < numColumns; columnIndex++){
        counter+=1
        cellStyleLocation = styleTableMapping[rowIndex][columnIndex]
        styleCellAttributes = templateTableCellAttributes[cellStyleLocation[0]][cellStyleLocation[1]]
        //      styleTextAttributes = templateTableTextAttributes[cellStyleLocation[0]][cellStyleLocation[1]]
        
        styleCell = {};
        for (attributeName in styleCellAttributes){
          if (styleCellAttributes[attributeName] != null && styleCellAttributes[attributeName] != ""){
            styleCell[DocumentApp.Attribute[attributeName]] = styleCellAttributes[attributeName]
          }
        }
        
        table.getCell(rowIndex, columnIndex).setAttributes(styleCell)
        
        
      }
      if (counter > cellLimit){
        return rowIndex
      }
    }
  }
  
  function insertRequirementsInSpec_asText(spec_id, requirements, body){
    var text = ''
    for (req in requirements){
      if (requirements[req]['specification'] === spec_id){
        text += requirements[req]['identifier'] + ': '+ requirements[req]['text'] + '\n'
      }  
    }
    return text
  }
  
  
  
  
  function insertRequirementsInSection_asText(section_id, requirements, body){
    var text = ''
    for (req in requirements){
      if (requirements[req]['group'] === section_id){
        text += requirements[req]['identifier'] + ': '+ requirements[req]['text'] + '\n'
      }  
    }
    return text
  }
  
  function insertRequirementsInSpec_asTable(spec_id, requirements, body){
    var cells = []
    for (req in requirements){
      if (requirements[req]['specification'] === spec_id){
        cells.push([requirements[req]['identifier'], requirements[req]['text']])
      }  
    }
    return cells
  }
  
  function insertRequirementsInSpec_asTable2(spec_id, requirements){
    doc = DocumentApp.getActiveDocument();
    body = doc.getBody();
    
    var cells = []
    for (req in requirements){
      if (requirements[req]['specification'] === spec_id){
        cells.push([requirements[req]['identifier'], requirements[req]['text']])
      }  
    }
    
    var docTable = body.appendTable(cells)
  //  return cells
  }
  
  function get_tag(tag_id){
    return JSON.parse(getAuthenticatedValispaceUrl('tag/'+tag_id+'/'));
  }
  
  function get_tags(){
    return JSON.parse(getAuthenticatedValispaceUrl('tag/')); 
  }
  
  function get_groups(project_id){
    return JSON.parse(getAuthenticatedValispaceUrl('requirements/groups/?project='+project_id)); 
  }
  
  function get_files(project_id){
    return JSON.parse(getAuthenticatedValispaceUrl('files/?project='+project_id)); 
  }
  
  function get_requirements(project_id){
    return JSON.parse(getAuthenticatedValispaceUrl('requirements/full_list/?project='+project_id+'&clean_text=text,comment'));
  }
  
  function get_requirement(req_id){
    
    return JSON.parse(getAuthenticatedValispaceUrl('requirements/'+req_id+'/'));
  }
  
  function get_specification(spec_id){
    return JSON.parse(getAuthenticatedValispaceUrl('requirements/specifications/'+spec_id));
  }
  
  function connect_temp123(){
   
  }
  