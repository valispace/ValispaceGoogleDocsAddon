var Users;
var Groups;
var Files;
var Files_dict = {};

var individualReq 
var firstRowHeader


function getUsers(){
  const responseUsers = getAuthenticatedValispaceUrl('user/')
  Users = JSON.parse(responseUsers.getContentText());
}
function getGroups(){
  const responseGroups = getAuthenticatedValispaceUrl('group/')
  Groups = JSON.parse(responseGroups.getContentText());
}

function GenerateFilesDict(){
    id = 85;
    responseFiles = getAuthenticatedValispaceUrl('files/?project='+String(id))
    Files = JSON.parse(responseFiles.getContentText());

    
    for (var file_index in Files){
      if (Files[file_index].name == "") {
        reference_file_id = Files[file_index].reference_file
        reference_file = Files.filter( function(file){return (file.id==reference_file_id);})[0]
        Files_dict[String(Files[file_index].id)] = reference_file.name; 
      } else {
      Files_dict[String(Files[file_index].id)] = Files[file_index].name;  
      }

    }

}

function getRequirementTree(id){
  const myId = id ;
  //Logger.log(myId)
  
  const responseLabels = getAuthenticatedValispaceUrl('requirements/specifications/labels/');
  const responseRequirementGroups = getAuthenticatedValispaceUrl('requirements/groups/');
  const responseSpecifications = getAuthenticatedValispaceUrl('requirements/specifications/');
  const responseRequirements = getAuthenticatedValispaceUrl('requirements/');
  
  
  
  
  var labels = JSON.parse(responseLabels.getContentText());
  var requirementGroups = JSON.parse(responseRequirementGroups.getContentText());
  var specification = JSON.parse(responseSpecifications.getContentText());
  var requirements = JSON.parse(responseRequirements.getContentText());
  
  //  Logger.log("requirements")
  //  Logger.log(requirements)
  
  function checkProjectId(element) {
    return element.project === parseInt(this);
  }
  
  var projectLabels = labels.filter(checkProjectId,  myId);
  // requirement Groups cannot be filtered by projects, we keep it all
  var projectSpecifications = specification.filter(checkProjectId,  myId);
  var projectRequirements = requirements.filter(checkProjectId,  myId);
  //  Logger.log("projectRequirements")
  //  Logger.log(projectRequirements)
  
  
  return createRequirementTree(projectLabels, requirementGroups, projectSpecifications, projectRequirements, null, 0);
  
}


function createSpecificationTree(specificationRequirementGroups, specRequirements, currentSpecification){
  var deployment = PropertiesService.getUserProperties().getProperty('deployment');
  // Create the specifications tree
  
  var linkSpec = deployment + "/specifications/" + currentSpecification.id;
  var specHtml = '<li><span class="caret"><i class="valiIcon fas fa-clipboard-check"></i>'
  specHtml+= '<i class="Specification">' + currentSpecification.name + '   </i></span>';
  specHtml+= '<i class="fa fa-plus addSpecification" id="'+linkSpec+'"></i><ul class="nested">'
  
  function check_spec_requirement_id(element){
    return element.id === parseInt(this);
  }
  
  
  function cleanupSpecRequirements(element){
    return element.id !== parseInt(this);
  }
  
  var i;  
  var alreadyEnteredRequirements = [];
  for(i = 0 ; i < specificationRequirementGroups.length; i++){
    specHtml+='<li><span class="caret" ><i class="valiIcon fas fa-list"></i>' + specificationRequirementGroups[i].name + '</span><ul class="nested">'
    var j;
    for(j = 0 ; j < specificationRequirementGroups[i].requirements.length; j++){
      var req = specRequirements.filter(check_spec_requirement_id, specificationRequirementGroups[i].requirements[j])[0];
      specRequirements = specRequirements.filter(cleanupSpecRequirements, specificationRequirementGroups[i].requirements[j]);
      var linkReq = deployment + "/specifications/requirements/" + req.id + "/components";
      specHtml+='<li class="requirement" id="' + linkReq + '"><i class="valiIcon fas fa-check"></i>' + req.identifier + '</li>';
    }
    specHtml += "</ul></li>";   
  }
  
  for( j = 0 ; j < specRequirements.length ; j++){
    var linkReq = deployment + "/specifications/requirements/" + specRequirements[j].id + "/components";
    specHtml+='<li class="requirement" id="' + linkReq + '"><i class="valiIcon fas fa-check"></i>' + specRequirements[j].identifier + '</li>';
  }
  
  specHtml += '</ul></li>'
  return specHtml;
  
  
}

function createRequirementTree(projectLabels, requirementGroups, projectSpecifications, projectRequirements, parentLabel, profondeur){
  
  //Logger.log(profondeur); Logger.log(parentLabel);
  
  var parentLabelThis;
  if (parentLabel === null){
    parentLabelThis = -666;
  } else {
    parentLabelThis = parentLabel;
  }  
  
  //////////////////////////////////////////////////
  // Filtering Function
  function checkLabelParent(element){
    var parentLabelLocal = parseInt(this);
    if(parentLabelLocal === -666){
      return element.parent === null;
    }
    else{
      return element.parent === parentLabelLocal;
    }
  }
  
  function checkLabelId(element){
    return element.id === parseInt(this);
  }
  
  
  function checkSpecificationLabel(element){
    if(element.labels.length === 0){
      return parseInt(this) === -666;// If the spec has no parent, it is at the root
    } else {
      return element.labels.indexOf(parseInt(this)) > -1;
    } 
  }
  
  function checkIsSpecificationRequirementGroup(element){
    return element.group == this.id
    //    return this.requirement_groups.indexOf(element.id) > -1;
  }
  
  function checkIsSpecificationRequirement(element){
    return element.specification == this.id
    //    return this.requirements.indexOf(element.id) > -1; 
  }
  
  //////////////////////////////////////////////////
  
  
  
  // We load the values of the current level
  var currentLabels = projectLabels.filter(checkLabelParent, parentLabelThis);
  var currentSpecifications = projectSpecifications.filter(checkSpecificationLabel, parentLabelThis);
  //Logger.log("projectRequirements")
  //Logger.log(projectRequirements)
  
  var newHtml = "";
  
  if (parentLabelThis === -666){ // If we are at the root of the project
    newHtml = '<ul class="topUl">';
  } else {
    var currentParentLabel = projectLabels.filter(checkLabelId, parentLabelThis)[0];
    newHtml += '<li><span class="caret"><i class="valiIcon fas fa-folder"></i>' + currentParentLabel.name + '</span>';
    newHtml += '<ul class="nested">';
  }
  
  
  var i;
  
  // Put the Labels First
  for(i = 0 ; i < currentLabels.length ; i++){
    newHtml += createRequirementTree(projectLabels, requirementGroups, projectSpecifications, projectRequirements, currentLabels[i].id, profondeur + 1) ; 
  }
  
  // Specifications
  for(i = 0 ; i < currentSpecifications.length ; i++){
    
    //Logger.log(currentSpecifications[i])
    var specificationRequirementGroups = requirementGroups.filter(checkIsSpecificationRequirementGroup, currentSpecifications[i]);
    var specificationRequirements = projectRequirements.filter(checkIsSpecificationRequirement, currentSpecifications[i]);
    newHtml += createSpecificationTree(specificationRequirementGroups, specificationRequirements,  currentSpecifications[i]);
  }
  
  // Closing Tags
  if (parentLabelThis === -666){
    newHtml += "</ul>";
  } else {
    newHtml += "</ul></li>";
  }
  
  return newHtml; 
  
}


function insertSpecification(link){
  
  getUsers() 
  getGroups()
  
  var individualReq = PropertiesService.getDocumentProperties().getProperty('individualReq');
  var firstRowHeader = PropertiesService.getDocumentProperties().getProperty('firstRowHeader');
  
  //  DocumentApp.getUi().alert("Clicked on a Specification. Work in Progress.")
  
  var specId = link.split("/specifications/")[1].split("/")[0];
  
  
  const responseRequirements = getAuthenticatedValispaceUrl('requirements/');
  var reqAll = JSON.parse(responseRequirements.getContentText());
  
  function check_spec_requirement_id(element){
    return element.specification === parseInt(this);
  }    
  
  var Requirements = reqAll.filter(check_spec_requirement_id, specId)
  
  
  var body = DocumentApp.getActiveDocument().getBody();
  var cursor = DocumentApp.getActiveDocument().getCursor();
  if (cursor) {
    var element = cursor.getElement();
    while (element.getParent().getType() != DocumentApp.ElementType.BODY_SECTION) {
      element = element.getParent();
    }
    var index = body.getChildIndex(element);
  }
  else {
    DocumentApp.getUi().alert("Could not find current position. Please click on the text where you want to add the requirement.");
    return;
  }
  
  var ReqTableID = PropertiesService.getDocumentProperties().getProperty('ReqTableID');
  try{
    var templatedoc = DocumentApp.openById(ReqTableID);
  } catch (error) {
    DocumentApp.getUi().alert("Could not find the document. Confirm it was not deleted and that anyone have read access with the link.");
    //Logger.log("Document not accessible", ReqTableID)
  } 
  
  fields = ["id",
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
  
  
  
  var reqTableItem = templatedoc.getChild(1).copy();
  
  var table = body.appendTable();
  
  
  if (individualReq==="false"){
    if (firstRowHeader==="true"){ 
      table.appendTableRow(reqTableItem.getRow(0).copy())
    }
  }
  
  for (var reqnum = 0 ; reqnum < Requirements.length; reqnum++){
    req = Requirements[reqnum];
    
    if (firstRowHeader==="true"){    
      var startrow = 1;
    } else {
      var startrow = 0;
    }
    
    for (var j=startrow; j<reqTableItem.getNumRows(); j++){
      var RowToCopy = reqTableItem.getRow(j).copy()
      
      replaceFields(RowToCopy);
      
      if (individualReq==="true"){
        table.appendTableRow(RowToCopy);
      } else {
        table.appendTableRow(RowToCopy)
      };
    };
    
    if (individualReq==="true") {
      var reqTable = body.insertTable(index+1+reqnum,table.copy())
      table.clear();
    };
    
  };
  
  
  if (individualReq==="false"){
    var reqTable = body.insertTable(index+1,table);
  };  
}

function insertSpecification_withSection(link){
  console.log("Starting Insert Specification");
  //INITIAL SETUP
  //---------------------------------------------------------------------------------------------------------------------------------------------------
  getUsers()
  getGroups()

  GenerateFilesDict()
  var startTime, endTime, timeDiff;
  
  //GET OPTIONS OF THE PLUGIN
  //---------------------------------------------------------------------------------------------------------------------------------------------------
  var individualReq = PropertiesService.getDocumentProperties().getProperty('individualReq');
  var firstRowHeader = PropertiesService.getDocumentProperties().getProperty('firstRowHeader');
  
  //  DocumentApp.getUi().alert("Clicked on a Specification. Work in Progress.")
  
  startTime = new Date();
  //REQUESTING DATA TO VALISPACE
  //---------------------------------------------------------------------------------------------------------------------------------------------------
  console.log("REQUESTING DATA TO VALISPACE");
  var specId = link.split("/specifications/")[1].split("/")[0]; // This gets the specification Id stripping the link
  
  const responseRequirementGroups = getAuthenticatedValispaceUrl('requirements/groups/');
  var groupsAll = JSON.parse(responseRequirementGroups.getContentText());
  
  const responseSpecification = getAuthenticatedValispaceUrl('requirements/specifications/'+String(specId));
  var Specification = JSON.parse(responseSpecification.getContentText());
  specificationGroups = Specification.requirement_groups;
  
  const responseRequirements = getAuthenticatedValispaceUrl('requirements/');
  var reqAll = JSON.parse(responseRequirements.getContentText());
  
  endTime = new Date();
  timeDiff = endTime - startTime;
  console.log(timeDiff + " ms");
  
  //DEFINING FILTERING FUNCTIONS
  //---------------------------------------------------------------------------------------------------------------------------------------------------
  function check_spec_requirement_id(element){
    return element.specification === parseInt(this);
  } ;   
  function check_spec_requirement_group(element){
    return element.group === parseInt(this);
  };
  function check_spec_requirement_noGroup(element){
    return element.group === null || element.group === undefined 
  };
  function check_spec_Group_id(element){
    return element.id === parseInt(this);
  }
  
  
  
  
  
  // Get body and document
  var document = DocumentApp.getActiveDocument();
  var body = document.getBody();
  
  
  
  //GETS THE INDEX VAR (CURRENTLY UNUSED)
  //---------------------------------------------------------------------------------------------------------------------------------------------------
  var cursor = document.getCursor();
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
  //---------------------------------------------------------------------------------------------------------------------------------------------------
  //--> index
  
  
  
  //GETS THE TEMPLATE TABLE
  //---------------------------------------------------------------------------------------------------------------------------------------------------
  var ReqTableID = PropertiesService.getDocumentProperties().getProperty('ReqTableID');
  try{
    var templatedoc = DocumentApp.openById(ReqTableID);
  } catch (error) {
    DocumentApp.getUi().alert("Could not find the document. Confirm it was not deleted and that anyone have read access with the link.");
    //Logger.log("Document not accessible", ReqTableID)
  } 
  var reqTableItem = templatedoc.getChild(1).copy();
  //---------------------------------------------------------------------------------------------------------------------------------------------------
  //--> reqTableItem
  
  
  fields = ["id",
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
            "owner_wgroup",
            "files",
            "images"];
  
  
  
  // 
  var table = body.appendTable();
  
  
  //Sets the first row as header if selected
  //---------------------------------------------------------------------------------------------------------------------------------------------------
  if (individualReq==="false"){
    if (firstRowHeader==="true"){ 
      AppendedRow = table.appendTableRow(reqTableItem.getRow(0).copy())
    };
  };
  
  
  // GET THE REQUIREMENTS
  startTime = new Date();
  console.log("GET THE REQUIREMENTS");
  var Requirements = reqAll.filter(check_spec_requirement_id, specId)
  Requirements.sort(function (req1, req2) {
    return req2.id - req1.id;
  })
  //  For Some Reason the filter returns the Id order inverted
  //Requirements.reverse(); // TODO: Check memory size of a reversion of a list. It can be memory intensive
  endTime = new Date();
  timeDiff = endTime - startTime;
  console.log(timeDiff + " ms");
  
  index_ = body.getChildIndex(table)
//  console.log("Starting Index: " + String(index_));
  
  var document = DocumentApp.getActiveDocument();
  var body = document.getBody();
  var table = body.appendTable();
  
  specificationGroups.reverse();
  
  for (var i in specificationGroups){

    
    // FILTER GROUP AND GET REQUIREMENTS ON THE GROUP
    var Group = groupsAll.filter(check_spec_Group_id, specificationGroups[i])[0]
//    console.log("Starting Filterinr Requirements by Specification SEcion");
    var Requirements_onGroup = Requirements.filter(check_spec_requirement_group, specificationGroups[i]);
//    console.log("Finished Filterinr Requirements by Specification SEcion");
    
    
    
    //logger.log(Requirements_onGroup.length)
    
    addRequirementRow(Requirements_onGroup, reqTableItem, table)
    
    var document = DocumentApp.getActiveDocument();
    var body = document.getBody();
    var table = body.appendTable();
    // Insert a paragraph with the title if there are requirements on the group
    if (Requirements_onGroup.length != 0){
      //      index_ = body.getChildIndex(table)
      var text = body.insertParagraph(index_, "\r"+Group.name).setHeading(DocumentApp.ParagraphHeading.HEADING2)
      
      //    console.log("Starting Insert Requirements Group");
    
//    console.log("Starting Insert Requirements Group");
    }
  };
 
  
  var Requirements_NoGroup = Requirements.filter(check_spec_requirement_noGroup, specificationGroups[i]);
  
  if (Requirements_NoGroup.length != 0){
    addRequirementRow(Requirements_NoGroup, reqTableItem, table)
    index_ = body.getChildIndex(table)
    var text = body.insertParagraph(index_, "\r Requirements with no Section").setHeading(DocumentApp.ParagraphHeading.HEADING2)
  }
  
  // IF WE NEED TO INSERT THEM ALL IN ONE TABLE
  if (individualReq==="false"){
    var reqTable = body.insertTable(index_,table);
  };
  
  
  function addRequirementRow(Requirements, reqTableItem, table){

    var document = DocumentApp.getActiveDocument();
    var body = document.getBody();
    for (var reqnum = 0 ; reqnum < Requirements.length; reqnum++){
      //      TODO: Just make a copy of the template table
      var table = body.appendTable(reqTableItem.copy());
//      console.log(String(Requirements[reqnum].id))
      req = Requirements[reqnum];
      // If all in one table don't copy the header
      if (firstRowHeader==="true"){    
        var startrow = 1;
      } else {
        var startrow = 0;
      }
      
        replaceFields(table);
      
      if (individualReq==="true") {
        var reqTable = body.insertTable(index_,table.copy())
        table.clear();
        table = body.appendTable();
        
      };
      
      
      if (reqnum % 10 == 0){
        //TODO: We need to save the document if it has made changes every 5 tables for example
        startTime = new Date();
        console.log("Save document")
        document.saveAndClose();
        endTime = new Date();
        timeDiff = endTime - startTime;
        console.log(timeDiff + " ms");

        
        var document = DocumentApp.getActiveDocument();
        var body = document.getBody();
     }
    }; 

  }
}


function replaceFields(RowToCopy){
  for (var i=0; i<fields.length; i++){
    var field = RowToCopy.findText("#"+fields[i]+"#")
    
    if (field != null){ 
      var deployment = PropertiesService.getUserProperties().getProperty('deployment');
      req_link = deployment+"/specifications/requirements/"+req["id"]
      //          Logger.log(req_link)
      //          Logger.log(req[fields[i]])
      
      reqFieldAttributes = field.getElement().asText().getAttributes()
      delete reqFieldAttributes.LINK_URL;
      
      field.getElement().asText().setLinkUrl(req_link + "?field="+"#" + fields[i] + "#")
      field.getElement().asText().setAttributes(reqFieldAttributes)
      
      if (req[fields[i]] != null) {
        if (fields[i] == "text" || fields[i] == "comment"){
          RowToCopy.replaceText("#"+fields[i]+"#", interpretReqTextSimple(req[fields[i]]));
        } else if (fields[i] == "owner") {
          var owner = Users.filter(function(user){return (user.id==req[fields[i]]["id"]);})[0]
          owner_fullname = owner.first_name + " " + owner.last_name
          RowToCopy.replaceText("#"+fields[i]+"#", owner_fullname);
        } else {
          RowToCopy.replaceText("#"+fields[i]+"#", req[fields[i]]);
        };
      } else if (fields[i]=="owner_wgroup" && req["owner"] != null) {
        // This is a special querry, to look for which group the user is at only work for single group on a user
        var owner = Users.filter( function(user){return (user.id==req["owner"]["id"]);})[0]
        var group = Groups.filter( function(group){return (group.id==owner.groups[0]);})[0]
        if (group == "undefined"){
          group = "No Group"
        }
        RowToCopy.replaceText("#"+fields[i]+"#", group.name + " - " + owner.first_name + " " + owner.last_name);          
        
      } else if (fields[i]=="files") {
        var files_onReq = Files.filter(function(files){return (files.object_id==req.id && files.mimetype!="image/png");})
        files_names = ""
        
        for (var file_index in files_onReq){    
          Logger.log(files_onReq[file_index].mimetype)
          file_id = parseInt(files_onReq[file_index].id)
          files_names = files_names + Files_dict[file_id] + ", "    
        }
        RowToCopy.replaceText("#"+fields[i]+"#", files_names)
//      } else if (fields[i]=="images") {
//        var images_onReq = Files.filter(function(files){return (files.object_id==req.id && files.mimetype=="image/png");})
//        for (var file_index in images_onReq){    
//          file_id = parseInt(images_onReq[file_index].id)
//          var resp = UrlFetchApp.fetch(images_onReq[file_index].download_url);
//          body.appendImage(resp.getBlob())
//        }
      } else {
        RowToCopy.replaceText("#"+fields[i]+"#", "");
      };         
    };
  }; 
}


// Insert a Requirement into the Document.
// Function that is working with the new Requirement Template, which substitutes the "#property#"
function insertRequirement(link){ 
  // The id requirements is contained just after / requirements / in the url
  var reqId = link.split("/requirements/")[1].split("/")[0];
  
  var req = getReqValue(reqId);
  
  var insertedText = req.identifier;
  
  
  var body = DocumentApp.getActiveDocument().getBody();
  var cursor = DocumentApp.getActiveDocument().getCursor();
  if (cursor) {
    var element = cursor.getElement();
    while (element.getParent().getType() != DocumentApp.ElementType.BODY_SECTION) {
      element = element.getParent();
    }
    var index = body.getChildIndex(element);
  }
  else {
    DocumentApp.getUi().alert("Could not find current position. Please click on the text where you want to add the requirement.");
    return;
  }
  
  var ReqTableID = PropertiesService.getDocumentProperties().getProperty('ReqTableID');
  try{
    var templatedoc = DocumentApp.openById(ReqTableID);
  } catch (error) {
    DocumentApp.getUi().alert("Could not find the document. Confirm it was not deleted and that anyone have read access with the link.");
    //Logger.log("Document not accessible", ReqTableID)
  } 
  
  var reqTable = body.insertTable(index+1,templatedoc.getChild(1).copy());
  
  // Add a for loop to check for the #elements# and then another loop to make the replacements for only what is available.
  
  //  var reqId = reqTable.findText( "#id#")
  //  reqIdAttributes = reqId.getElement().asText().getAttributes()
  //  delete reqIdAttributes.LINK_URL;
  //  reqId.getElement().asText().setLinkUrl(link + "?field=id")
  //  reqId.getElement().asText().setAttributes(reqIdAttributes)
  //  reqTable.replaceText('#id#', req.identifier)
  //    
  //  var reqText = reqTable.findText('#text#')
  //  reqTextAttributes = reqText.getElement().asText().getAttributes()
  //  delete reqTextAttributes.LINK_URL;
  //  reqText.getElement().asText().setLinkUrl(link + "?field=text")
  //  reqText.getElement().asText().setAttributes(reqTextAttributes)
  //  reqTable.replaceText('#text#', interpretReqTextSimple(req.text))
  //  
  //  var reqTags = reqTable.findText('#tags#')
  //  //reqTags.getElement().asText().setLinkUrl(link)
  //  reqTable.replaceText('#tags#', req.tags)
  //  
  //  var reqParents = reqTable.findText('#parents#')
  //  //reqParents.getElement().asText().setLinkUrl(link)
  //  reqTable.replaceText('#parents#', req.parents)
  //  
  //  var reqComment = reqTable.findText('#comment#')
  //  //reqComment.getElement().asText().setLinkUrl(link)
  //  reqTable.replaceText('#comment#', interpretReqTextSimple(req.comment))
  //  
  //  var reqCreated = reqTable.findText('#created#')
  //  //reqCreated.getElement().asText().setLinkUrl(link)
  //  reqTable.replaceText('#created#', req.created)
  //  
  //  //var reqIdText = reqTable.getCell(1, 0).setText("[" + req.identifier + "]");
  //  //reqId.setLinkUrl(link);
  //  //reqTable.setLinkUrl(link);
  
  fields = ["id",
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
            "position"];
  for (var i=0; i<fields.length; i++){
    var field = reqTable.findText("#"+fields[i]+"#")
    if (field != null){ 
      reqFieldAttributes = field.getElement().asText().getAttributes()
      delete reqFieldAttributes.LINK_URL;
      field.getElement().asText().setLinkUrl(link + "?field="+"#" + fields[i] + "#")
      field.getElement().asText().setAttributes(reqFieldAttributes)
      if (req[fields[i]] != null) {
        if (fields[i] == "text" || fields[i] == "comment"){
          reqTable.replaceText("#"+fields[i]+"#", interpretReqTextSimple(req[fields[i]]));
        } else{
          reqTable.replaceText("#"+fields[i]+"#", req[fields[i]]);
        };
      }else{
        reqTable.replaceText("#"+fields[i]+"#", "");
      };         
    } ;
  };
  
  
  
}  


// Interpret the requirements, return a paragraph and insert in a table cell.
function interpretReqText(textReq, cell){
  var deployment = PropertiesService.getUserProperties().getProperty('deployment');
  var interpreted = textReq;
  const valiRegex = /<vali[^>]*?\[id\]="([0-9]+?)"[^>]*?>[\s\S]*?<\/vali>/gm
  const findIDregex = /\[id\]="([0-9]+?)"/
  const findFieldRegex = /field="([^"]+?)"/
  var valis = textReq.match(valiRegex);
  var count = 0;
  
  interpreted = interpreted.replace(valiRegex,"$$$$VALI$$$$");
  
  // we remove the tags <p>/
  const pReplacementRegex = /<\/?p[^>]*?>/g
  interpreted = interpreted.replace(pReplacementRegex, "")
  
  // we remove the tags <span>
  const spanReplacementRegex = /<\/?span[^>]*?>/g
  interpreted = interpreted.replace(spanReplacementRegex, "")
  
  // We replace the <br> tags with line breaks
  const brReplacementRegex = /<\/?br[^>]*?>/g
  interpreted = interpreted.replace(brReplacementRegex, "\n")
  
  // Replace the lists
  const ulOpenReplacementRegex = /<\/?ul[^>]*?>/g
  interpreted = interpreted.replace(ulOpenReplacementRegex, "");
  const liOpenReplacementRegex = /<li[^>]*?>/g
  interpreted = interpreted.replace(liOpenReplacementRegex, "\n\t - ");
  const liCloseReplacementRegex = /<\/li>/g
  interpreted = interpreted.replace(liCloseReplacementRegex, "");
  
  var splitted = interpreted.split('$$VALI$$');
  
  
  var i;
  var para = cell.getChild(0);
  cell.setText("");
  
  
  
  for(i = 0 ; i < splitted.length ; i++){
    para.appendText(splitted[i]);
    if (i !== splitted.length - 1){
      var idVali = parseInt(valis[i].match(findIDregex)[1]);
      var vali = getValiValue(idVali);
      var valiTxt = "";
      if (vali.unit.length > 0){
        valiTxt = vali.value + " " + vali.unit;
      } else {
        valiTxt = vali.value;
      }
      
      var link;
      if(vali.parent_model === 'requirement'){
        link =   deployment+'/specifications/requirements/' + vali.parent_object_id + '/valis';
      } else {
        link =  deployment+'/components/'+ vali.parent_object_id + '/properties/vali/' + vali.id;
      }
      var newTxt = para.appendText(valiTxt);
      para.appendText(" ");
      newTxt.setLinkUrl(0, valiTxt.length - 1, link);
    }
  }  
}


function interpretReqTextSimple(textReq){
  var deployment = PropertiesService.getUserProperties().getProperty('deployment');
  var interpreted = textReq;
  const valiRegex = /<vali[^>]*?\[id\]="([0-9]+?)"[^>]*?>[\s\S]*?<\/vali>/gm
  const findIDregex = /\[id\]="([0-9]+?)"/
  const findFieldRegex = /field="([^"]+?)"/
  var valis = textReq.match(valiRegex);
  var count = 0;
  
  interpreted = interpreted.replace(valiRegex,"$$$$VALI$$$$");
  
  // we remove the tags <p>/
  const pReplacementRegex = /<\/?p[^>]*?>/g
  interpreted = interpreted.replace(pReplacementRegex, "")
  
  
  // we remove the tags <span>
  const spanReplacementRegex = /<\/?span[^>]*?>/g
  interpreted = interpreted.replace(spanReplacementRegex, "")
  
  // We replace the <br> tags with line breaks
  const brReplacementRegex = /<\/?br[^>]*?>/g
  interpreted = interpreted.replace(brReplacementRegex, "\n")
  
  // Replace the lists
  const ulOpenReplacementRegex = /<\/?ul[^>]*?>/g
  interpreted = interpreted.replace(ulOpenReplacementRegex, "");
  const liOpenReplacementRegex = /<li[^>]*?>/g
  interpreted = interpreted.replace(liOpenReplacementRegex, "\n\t - ");
  const liCloseReplacementRegex = /<\/li>/g
  interpreted = interpreted.replace(liCloseReplacementRegex, "");
  
  var splitted = interpreted.split('$$VALI$$');
  
  var i;
  var text = "";
  
  for(i = 0 ; i < splitted.length ; i++){
    text = text + splitted[i];
    if (i !== splitted.length - 1){
      var idVali = parseInt(valis[i].match(findIDregex)[1]);
      var vali = getValiValue(idVali);
      var valiTxt = "";
      if (vali.unit.length > 0){
        valiTxt = vali.value + " " + vali.unit;
      } else {
        valiTxt = vali.value;
      }
      
      var link;
      if(vali.parent_model === 'requirement'){
        link =   deployment+'/specifications/requirements/' + vali.parent_object_id + '/valis';
      } else {
        link =  deployment+'/components/'+ vali.parent_object_id + '/properties/vali/' + vali.id;
      }
      text = text + valiTxt;
      text = text + " ";
      //text.setLinkUrl(0, valiTxt.length - 1, link);
    }
  } 
  
  return text
}






function getReqValue(reqId){
  var responseReq = getAuthenticatedValispaceUrl('requirements/' + reqId);
  var req = JSON.parse(responseReq.getContentText());
  
  // Verifications: 
  var i;
  req['method'] = "";
  
  for(i = 0 ; i < req.component_requirements.length ; i++){
    var responseComponentReq = getAuthenticatedValispaceUrl("requirements/component-requirements/" + req.component_requirements[i]);
    var compReq = JSON.parse(responseComponentReq.getContentText());
    var componentResponse = getAuthenticatedValispaceUrl("components/" + compReq.component);
    var componentName = JSON.parse(componentResponse.getContentText()).name;
    var responseVerif = getAuthenticatedValispaceUrl("requirements/verifications/" + compReq.verifications);
    var verificationMethod = JSON.parse(responseVerif.getContentText()).method;
    var verifMethodText;
    if (verificationMethod === null){
      verifMethodText = "NA";
    } else { 
      var responseMethodName = getAuthenticatedValispaceUrl("requirements/verification-methods/" + verificationMethod);
      verifMethodText = JSON.parse(responseMethodName.getContentText()).name;
    }
    //    
    req.method +=  componentName + ": " + verifMethodText  ;// name + ": " + verifMethodText;
    
  }
  //var responseVerifMethod = getAuthenticatedValispaceUrl('requirements/verifications/' + reqId);
  //var verifMethodId = JSON.parse(responseVerifMethod.getContentText()).method;
  
  
  return req  
};
