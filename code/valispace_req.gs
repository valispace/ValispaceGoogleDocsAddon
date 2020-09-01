
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
  
  var reqTableItem = templatedoc.getChild(1).copy();
  
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
  
  for (var reqnum = 0 ; reqnum < Requirements.length; reqnum++){

    
    var RowToCopy = reqTableItem.getRow(1).copy();
    
    
    req = Requirements[reqnum];
    
    for (var i=0; i<fields.length; i++){
      var field = RowToCopy.findText("#"+fields[i]+"#")
      if (field != null){ 
        var deployment = PropertiesService.getUserProperties().getProperty('deployment');
        req_link = deployment+"/specifications/requirements/"+req["id"]
        Logger.log(req_link)
        
        reqFieldAttributes = field.getElement().asText().getAttributes()
        delete reqFieldAttributes.LINK_URL;
        
        field.getElement().asText().setLinkUrl(req_link + "?field="+"#" + fields[i] + "#")
        field.getElement().asText().setAttributes(reqFieldAttributes)
        if (req[fields[i]] != null) {
          if (fields[i] == "text" || fields[i] == "comment"){
            RowToCopy.replaceText("#"+fields[i]+"#", interpretReqTextSimple(req[fields[i]]));
          } else{
            RowToCopy.replaceText("#"+fields[i]+"#", req[fields[i]]);
          };
        }else{
          RowToCopy.replaceText("#"+fields[i]+"#", "");
        };         
      } ;
    }; 
    var AppendedRow = reqTableItem.appendTableRow(RowToCopy);
  }
  
  
  var reqTable = body.insertTable(index+1,reqTableItem);
  reqTable.removeRow(1)
  
  


  
}


// Insert a Requirement into the Document.
// Function that is working with the new Requirement Template, which substitutes the "#property#"
function insertRequirement(link){ 
  Logger.log(link)
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
    //Logger.log(req);
    
  }
  //var responseVerifMethod = getAuthenticatedValispaceUrl('requirements/verifications/' + reqId);
  //var verifMethodId = JSON.parse(responseVerifMethod.getContentText()).method;
  
  
  return req  
};
