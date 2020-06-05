// ****************************************************************************************
// Fonctions de creation de l'arborescence des requirements
// ****************************************************************************************



function getRequirementTree(id){
  Logger.log("Bonjour tout le monde get Requirements tree"); Logger.log(id);
  const myId = id ;
  
  Logger.log(myId);
  
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
  // requirementGroups ne peut pas être filtré par projets, on le garde en entier...
  var projectSpecifications = specification.filter(checkProjectId,  myId);
  var projectRequirements = requirements.filter(checkProjectId,  myId);
 
  return createRequirementTree(projectLabels, requirementGroups, projectSpecifications, projectRequirements, null, 0);

}


function createSpecificationTree(specificationRequirementGroups, specRequirements, currentSpecification){
  var deployment = PropertiesService.getScriptProperties().getProperty('deployment');
  // Crée l'arborescence d'une spécification.
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
  
  Logger.log("Creating requirement tree profondeur"); 
  Logger.log(profondeur); Logger.log(parentLabel);
  
  var parentLabelThis;
  if (parentLabel === null){
    parentLabelThis = -666;
  } else {
    parentLabelThis = parentLabel;
  }  
  
  //////////////////////////////////////////////////
  // Fonctions de filtrage
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
      return parseInt(this) === -666;// Si la spec  n'a pas de parent c'est qu'elle est à la racine
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
  
  
  
  // On charge les valeurs du niveau en cours
  var currentLabels = projectLabels.filter(checkLabelParent, parentLabelThis);
  var currentSpecifications = projectSpecifications.filter(checkSpecificationLabel, parentLabelThis);

  // On crée l'output
  var newHtml = "";
  
  if (parentLabelThis === -666){ // Si on est à la racine du projet
    newHtml = '<ul class="topUl">';
  } else {
    var currentParentLabel = projectLabels.filter(checkLabelId, parentLabelThis)[0];
    newHtml += '<li><span class="caret"><i class="valiIcon fas fa-folder"></i>' + currentParentLabel.name + '</span>';
    newHtml += '<ul class="nested">';
  }
  
  
  var i;
  
  // On met d'abord les labels
  for(i = 0 ; i < currentLabels.length ; i++){
    newHtml += createRequirementTree(projectLabels, requirementGroups, projectSpecifications, projectRequirements, currentLabels[i].id, profondeur + 1) ; 
  }
  
  // On met ensuite les specifications
  for(i = 0 ; i < currentSpecifications.length ; i++){
    var specificationRequirementGroups = requirementGroups.filter(checkIsSpecificationRequirementGroup, currentSpecifications[i]);
    var specificationRequirements = projectRequirements.filter(checkIsSpecificationRequirement, currentSpecifications[i]);
    newHtml += createSpecificationTree(specificationRequirementGroups, specificationRequirements,  currentSpecifications[i]);
  }
  
  // on ferme les tags
  if (parentLabelThis === -666){
    newHtml += "</ul>";
  } else {
    newHtml += "</ul></li>";
  }
 
  return newHtml; 
  
}


// fonction d'insertion d'un requirement dans un document
function insertRequirement(link){
  
  Logger.log("INsert requirementsssssstrgjfdkgsmfdlkjg "); Logger.log(link);
  
  
  // L'id requirements est contenu juste après /requirements/ dans l'url
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
  
  var templatedoc = DocumentApp.openById('1w2Q8hezg4uRntRpFSCPl-ItY7QO9RT3mXBYz--tpf_A');
  
  var reqTable = body.insertTable(index+1,templatedoc.getChild(1).copy());
  var reqIdText = reqTable.getCell(0, 0).setText("[" + req.identifier + "]");
  reqIdText.setLinkUrl(link);
  
  
  
  
  // insert formatted text in the cell 
  interpretReqText(req.text, reqTable.getCell(1, 0));
  
  if(req.comment !== null){
    interpretReqText(req.comment, reqTable.getCell(2, 0));
    reqTable.getCell(2, 0).editAsText().setItalic(true);
  }
  
  
  
  
  reqTable.getCell(1, 1).setText(req.method);
      
//  var newText2 = cursor.insertText(insertedText);
//  newText2.setLinkUrl(link);
}


// Interprète les requirements et renvoie un paragraph 
function interpretReqText(textReq, cell){
  var deployment = PropertiesService.getScriptProperties().getProperty('deployment');
  var interpreted = textReq;
  const valiRegex = /<vali[^>]*?\[id\]="([0-9]+?)"[^>]*?>[\s\S]*?<\/vali>/gm
  const findIDregex = /\[id\]="([0-9]+?)"/
  const findFieldRegex = /field="([^"]+?)"/
  var valis = textReq.match(valiRegex);
  var count = 0;
  
  interpreted = interpreted.replace(valiRegex,"$$$$VALI$$$$"); // Il faut 4 dollars, je ne sais pas trop bine pourquoi mais ensuite il n'en reste que 2
  
  // on enleve les balises <p>/
  const pReplacementRegex = /<\/?p[^>]*?>/g
  interpreted = interpreted.replace(pReplacementRegex, "")
  
  
  // On enlève les balises <span>
  const spanReplacementRegex = /<\/?span[^>]*?>/g
  interpreted = interpreted.replace(spanReplacementRegex, "")
  
  // On remplace les balises <br> par des sauts de ligne
  const brReplacementRegex = /<\/?br[^>]*?>/g
  interpreted = interpreted.replace(brReplacementRegex, "\n")
  
  // On remplace les listes
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
      var responseVerif = getAuthenticatedValispaceUrl("requirements/verifications/" + req.component_requirements[i]);
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




// Fonction récursive de mise à jour des requirements
function updateAllRequirements(element, req, compReqs, components, verifications, verifMethods){
  var deployment = PropertiesService.getScriptProperties().getProperty('deployment');
  if(!element){
    element = DocumentApp.getActiveDocument().getBody();
     // On télécharge tous les requirements
    var responseReq = getAuthenticatedValispaceUrl('requirements');
    req = JSON.parse(responseReq.getContentText());
    // On télécharge tous les component_requirement
    var responseComponentReq = getAuthenticatedValispaceUrl("requirements/component-requirements");
    compReqs = JSON.parse(responseComponentReq.getContentText());
    // On télécharge tous les composants
    var componentResponse = getAuthenticatedValispaceUrl("components");
    components = JSON.parse(componentResponse.getContentText());
    // On télécharge les verifications
    var responseVerif = getAuthenticatedValispaceUrl("requirements/verifications");
    verifications = JSON.parse(responseVerif.getContentText());
    // On télécharge les verification methods
    var responseVerifMethod = getAuthenticatedValispaceUrl("requirements/verification-methods");
    verifMethods = JSON.parse(responseVerifMethod.getContentText());
  } 
  
  
  
  
  
  if (element.getType() === DocumentApp.ElementType.TABLE) {
     var link = element.getCell(0, 0).getChild(0).getLinkUrl();
    if (link){
      if (link.indexOf(deployment+"/specifications/requirements/") === 0){
        // On récupère l'id du req
        var reqId = parseInt(link.split("/requirements/")[1].split("/")[0]);
        
        // On récupère le requirement et on insère le texte qui va bien
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
        
        
  
        
        // Maintenant on met à jour les vérifications
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