
function getRequirementTree(id){
  const myId = id ;
  
  const responseLabels = getAuthenticatedValispaceUrl('requirements/specifications/labels/');
  const responseRequirementGroups = getAuthenticatedValispaceUrl('requirements/groups/');
  const responseSpecifications = getAuthenticatedValispaceUrl('requirements/specifications/');
  const responseRequirements = getAuthenticatedValispaceUrl('requirements/');
  
  var labels = JSON.parse(responseLabels.getContentText());
  var requirementGroups = JSON.parse(responseRequirementGroups.getContentText());
  var specification = JSON.parse(responseSpecifications.getContentText());
  var requirements = JSON.parse(responseRequirements.getContentText());
  
  
  function checkProjectId(element) {
    return element.project === parseInt(this);
  }
  
  var projectLabels = labels.filter(checkProjectId,  myId);
  // requirement Groups cannot be filtered by projects, we keep it all
  var projectSpecifications = specification.filter(checkProjectId,  myId);
  var projectRequirements = requirements.filter(checkProjectId,  myId);
 
  return createRequirementTree(projectLabels, requirementGroups, projectSpecifications, projectRequirements, null, 0);

}


function createSpecificationTree(specificationRequirementGroups, specRequirements, currentSpecification){
  var deployment = PropertiesService.getScriptProperties().getProperty('deployment');
  // Create the specifications tree
  var specHtml = "<li><span class='caret'><i class=' valiIcon fas fa-clipboard-check'></i>" + currentSpecification.name + "</span><ul class='nested'>";
  
  
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
    return this.requirement_groups.indexOf(element.id) > -1;
  }
  
  function checkIsSpecificationRequirement(element){
    return this.requirements.indexOf(element.id) > -1; 
  }
  
  //////////////////////////////////////////////////
  
  
  
  // We load the values of the current level
  var currentLabels = projectLabels.filter(checkLabelParent, parentLabelThis);
  var currentSpecifications = projectSpecifications.filter(checkSpecificationLabel, parentLabelThis);

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


// Insert a Requirement into the Document
function insertRequirement(link){
  //Logger.log(link);
  
  
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
    DocumentApp.getUi().alert("Could not find current position");
    return;
  }
  
  var templatedoc = DocumentApp.openById('1bDQClCWVcvzPARYl5ohGvBgZlQ519NGGCStqizzK-bU');
  
  var reqTable = body.insertTable(index+1,templatedoc.getChild(1).copy());
  var reqIdText = reqTable.getCell(1, 0).setText("[" + req.identifier + "]");
  reqIdText.setLinkUrl(link);
  
  
  
  
  // insert formatted text in the cell 
  interpretReqText(req.text, reqTable.getCell(1, 1));
  
  if(req.comment !== null){
    interpretReqText(req.comment, reqTable.getCell(1, 2));
    reqTable.getCell(1, 2).editAsText().setItalic(true);
  }
  
  
  //reqTable.getCell(1, 3).setText(req.method);
      
//  var newText2 = cursor.insertText(insertedText);
//  newText2.setLinkUrl(link);
}


// Interpret the requirements and return a paragraph
function interpretReqText(textReq, cell){
  var deployment = PropertiesService.getScriptProperties().getProperty('deployment');
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
    Logger.log(req);
    
  }
  //var responseVerifMethod = getAuthenticatedValispaceUrl('requirements/verifications/' + reqId);
  //var verifMethodId = JSON.parse(responseVerifMethod.getContentText()).method;
  
  
  return req  
};




// Recursive requirements update function
function updateAllRequirements(element, req, compReqs, components, verifications, verifMethods){
  var deployment = PropertiesService.getScriptProperties().getProperty('deployment');
  if(!element){
    element = DocumentApp.getActiveDocument().getBody();
     // Download all requirements
    var responseReq = getAuthenticatedValispaceUrl('requirements');
    req = JSON.parse(responseReq.getContentText());
    // Download all components_requirements
    var responseComponentReq = getAuthenticatedValispaceUrl("requirements/component-requirements");
    compReqs = JSON.parse(responseComponentReq.getContentText());
    // Download all components
    var componentResponse = getAuthenticatedValispaceUrl("components");
    components = JSON.parse(componentResponse.getContentText());
    // Download all veritications
    var responseVerif = getAuthenticatedValispaceUrl("requirements/verifications");
    verifications = JSON.parse(responseVerif.getContentText());
    // Download all verification methods
    var responseVerifMethod = getAuthenticatedValispaceUrl("requirements/verification-methods");
    verifMethods = JSON.parse(responseVerifMethod.getContentText());
  } 
  
  
  
  
  
  if (element.getType() === DocumentApp.ElementType.TABLE) {
     var link = element.getCell(0, 0).getChild(0).getLinkUrl();
    if (link){
      if (link.indexOf(deployment+"/specifications/requirements/") === 0){
        //Get the requirement id
        var reqId = parseInt(link.split("/requirements/")[1].split("/")[0]);
        
        // Retrieve the requirement and insert text
        var currentReq = req.filter(function(d){return d.id === parseInt(this); }, reqId);
        
        //DocumentApp.getUi().alert(currentReq[0]);
        Logger.log(currentReq[0]);
        
        var textReq = currentReq[0].text;
        var reqCell = element.getCell(1, 0);
        interpretReqText(textReq, reqCell);
        
        
        var rationaleText = currentReq[0].comment;
        var rationaleCell = element.getCell(2,0);
        if(rationaleText !== null){
          interpretReqText(rationaleText, rationaleCell);
          rationaleCell.editAsText().setItalic(true);
        } else {
          rationaleCell.setText("");
        }
        
        
  
        
        // Update the checks
        var childrenComponentRequirementIds = currentReq[0].component_requirements;
        var textValidation = ""
        
        var i;
        for(i = 0 ; i < childrenComponentRequirementIds.length ; i++){
          var childCompoReq = compReqs.filter(function(d){return d.id === parseInt(this);}, childrenComponentRequirementIds[i]);
          var compo = components.filter(function(d){return d.id === parseInt(this);}, childCompoReq[0].component);
          var verif = verifications.filter(function(d){return d.id === parseInt(this);}, childrenComponentRequirementIds[i]);
          var verifMethodText="";
          if (verif[0].method === null){
            verifMethodText = "NA";
          } else {
            verifMethodText = verifMethods.filter(function(d){return d.id === parseInt(this);}, verif[0].method)[0].name;
          }
          textValidation += compo[0].name + ': ' + verifMethodText ;
                                      
        }
        
        
        
        element.getCell(1,1).setText(textValidation);
      }
      
    }
  }
    // Get number of child elements, for elements that can have child elements. 
  try {
    var numChildren = element.getNumChildren();
  }
  catch (e) {
    numChildren = 0;
  }
  for (var i=0; i<numChildren; i++) {
    updateAllRequirements(element.getChild(i), req, compReqs, components, verifications, verifMethods);
  }
  
}