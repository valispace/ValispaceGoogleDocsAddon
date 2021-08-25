function update_all_values(objectList){
  var mergeAdjacent=false;
  var doc = DocumentApp.getActiveDocument();
  var update_images=true;

  var imgList = []
  var imgListNamedRange = doc.newRange();

  var base_path = PropertiesService.getUserProperties().getProperty('deployment_url')
  iterateSections(doc, function(section, sectionIndex, isFirstPageSection) {

    if (!("getParagraphs" in section)) {
      // as we're using some undocumented API, adding this to avoid cryptic
      // messages upon possible API changes.
      throw new Error("An API change has caused this script to stop " +
                      "working.\n" +
                      "Section #" + sectionIndex + " of type " +
                      section.getType() + " has no .getParagraphs() method. " +
        "Stopping script.");
    }
    var find_links = function(par) {
      // skip empty paragraphs
      if (par.getNumChildren() == 0) {
        return;
      }

      // go over all text elements in paragraph / list-item
      for (var el=par.getChild(0); el!=null; el=el.getNextSibling()) {
        // console.log(el.getType().name())
        if (el.getType() == DocumentApp.ElementType.TABLE ||
        el.getType() == DocumentApp.ElementType.TABLE_ROW ||
        el.getType() == DocumentApp.ElementType.TABLE_CELL ||
        el.getType() == DocumentApp.ElementType.PARAGRAPH){
          // find_links(el);
        }
        if (el.getType() == DocumentApp.ElementType.TEXT) {
          update_text(el, objectList, mergeAdjacent, base_path)
        }

        if (el.getType() == DocumentApp.ElementType.TEXT && el.getText() == '-') {
          console.log(el.getText());
          // TODO: Maybe this can be done outside the if, even though it only executes once inside the if
          update_placeholder_to_image(el, objectList, base_path);
        }

        if (el.getType() == DocumentApp.ElementType.INLINE_IMAGE &&
        update_images && el.asInlineImage() != NaN) {
          imgList.push(el.asInlineImage());
        }
      }
    };
    section.getParagraphs().forEach(find_links);
    section.getTables().forEach(find_links)
  });

  verify_and_update_images(imgList, objectList, base_path);
}
// Replaces the '-' placeholder by an image
function update_placeholder_to_image(placeholder, objectList, base_path) {

  linkUrl = placeholder.getLinkUrl()
  reqId = parseInt(linkUrl.split('requirements/')[1].split('?')[0])
  var imagesOnReq = objectList['files'].filter(x => x['object_id'] === parseInt(reqId) && x['mimetype'] !== null && x['mimetype'].includes("image/"));

  parent_element = placeholder.getParent();

  for ( img in imagesOnReq ) {
    textToInsert = generateFileURL(imagesOnReq[img]);
    if(parent_element.getText() == '-') {
      text = placeholder.replaceText(parent_element.getText(), textToInsert);
    } else {
      text = parent_element.appendText(textToInsert);
    }
    //if(parent_element.getText.indexOf('-') == 0) {
    //  text = parent.replaceText('', textToInsert);
    //}
    //// TODO: Maybe it is faster to do this only at the end.
    replaceImagesURLToFile(text)

    //removeFromList(reqsInDoc[req], parseInt(imagesOnReq[img]['id']))
  }
}

function verify_and_update_images(imgList, objectList, base_path){
  // TODO: CHeck if image needs to be update or not
  reqsInDoc = {} // Dictionary mapping an Req Id IN the document to its images, also in the document
  imgMap = {} // Maps an Valispace Image ID to the Document object, only contains images in the document
  toUpdate = [] // List of images that need to be updated

  // TODO: This can be done outside, direclty when the imgList is generated.
  for (img in imgList){
    imgURL = imgList[img].getLinkUrl()
    console.log(imgURL)
    reqId = parseInt(imgURL.split('requirements/')[1].split('?')[0])
    // TODO: Insted of a simple split, split with & and search for "name"
    imgId = parseInt(imgURL.split('files_')[1])
    if (reqId in reqsInDoc && !reqsInDoc[reqId].includes(imgId)){
      reqsInDoc[reqId].push(imgId)
    } else {
      reqsInDoc[reqId] = [imgId]
    }
    imgMap[imgId] = img
  }

  // console.log(reqsInDoc)
  for (var req in reqsInDoc){
    // All images existing in the Requirement (in Valispace DB)
    var imagesOnReq = objectList['files'].filter(x => x['object_id'] === parseInt(req) && x['mimetype'] !== null && x['mimetype'].includes("image/"))
    console.log("Images on Document: ")
    console.log(reqsInDoc[req])
    console.log("Images on Requirement: ")
    console.log(imagesOnReq)


    for (img in imagesOnReq){
      var imgID = parseInt(imagesOnReq[img]['id'])

      if (reqsInDoc[req].includes(imgID)){
        console.log('Exists in the Document and in the Requirement. UPDATE ON DOC')
        toUpdate.push(imgID)
        removeFromList(reqsInDoc[req], parseInt(imagesOnReq[img]['id']))
      } else {
        console.log('Doesnt exist in the Document but exist in the Requirement. INSERT')
        textToInsert = generateFileURL(imagesOnReq[img])
        text = imgList[0].getParent().appendText(textToInsert);
        // TODO: Maybe it is faster to do this only at the end.
        replaceImagesURLToFile(text)

        removeFromList(reqsInDoc[req], parseInt(imagesOnReq[img]['id']))
      }
    }

    if (reqsInDoc[req].length>0){
      console.log(req)
      console.log('Exist exist in the Document but doesnt in the Requirement. DELETE FROM DOC')
      //for (img in imgList.reverse()){
      for (var img=(imgList.length - 1); img>-1; img--) {
        console.log(img);
        imgURL = imgList[img].getLinkUrl()
        imgId = parseInt(imgURL.split('files_')[1])
        if (reqsInDoc[req].includes(imgId)){
          numChild = imgList[img].getParent().getNumChildren();
          console.log(numChild)
          if (numChild <= 1){
            text = imgList[img].getParent().appendText('-');
            text.setLinkUrl(base_path + `${VALI_PARAMETER_STR}requirements_${req}__images`)
          }
          imgList[img].removeFromParent()
        }
      }
    }
  }

  for (img in toUpdate){
    update_image(imgList[img], objectList, base_path)
  }

  function removeFromList(list, value){
    for (var i=0;i<list.length;i++){
      if(list[i]===value){
        list.splice(i,1)
      }
    }
  }
}

function update_text(el, objectList, mergeAdjacent=false, base_path){
  // console.log(el.getText(), el.getLinkUrl())
  // go over all styling segments in text element
  var attributeIndices_top = el.getTextAttributeIndices();
  var lastLink = null;

  attributeIndices_top.forEach(function(startOffset, i, attributeIndices) {
    startOffset=attributeIndices_top[i]
    var url = el.getLinkUrl(startOffset);
    if (url != null) {
      // we hit a link
      var endOffsetInclusive = (i+1 < attributeIndices.length?
        attributeIndices[i+1] : el.getText().length);
      // console.log(attributeIndices_top)
      // console.log(startOffset,endOffsetInclusive, el.getText())
      var text = el.getText().substring(startOffset, endOffsetInclusive)
      // check if this and the last found link are continuous
      if (mergeAdjacent && lastLink != null && lastLink.url == url &&
      lastLink.endOffsetInclusive == startOffset) {
        // this and the previous style segment are continuous
        lastLink.endOffsetInclusive = endOffsetInclusive;
        return;
      }
      if (url.includes(VALI_PARAMETER_STR)){
        urlName = url.split(VALI_PARAMETER_STR)[1]
        //TODO: Figure out a better way to define names. This is not general and is split between files.
        //Smth like a translator in the inserter
        var objectName = urlName.split('__')
        var objProperty = objectName[1];
        objectName = objectName[0].split("_");
        var objType = objectName[0].toString();
        var objId = parseInt(objectName[1]);
        var objData = objectList[objType].find(x => x['id'] === objId);
        // console.log(objData[objProperty])
        text_to_insert = "-"
        if(objData){
          if (objData[objProperty]) {
            text_to_insert = objData[objProperty];
          }
          if (objProperty == 'owner') {
            text_to_insert = getUserFrom(objData[objProperty], objectList['users'], objectList['user_groups']);
          }
          else if (objProperty == 'tags') {
            text_to_insert = replaceAttributesWithId('tags', objectList[types.tags.name], objData, 'name')
          }
          // Replacing Group (Section) Name
          else if (objProperty == 'section') {
            text_to_insert = replaceAttributesWithId('group', objectList[types.groups.name], objData, 'name')
          }
          // Replacing Parent Name
          else if (objProperty == 'parents') {
            //            textToInsert = replaceParents(requirements, req, 'identifier')
            text_to_insert = replaceAttributesWithId('parents', objectList[types.requirements.name], objData, 'identifier')
          }
          // Replacing Children Name
          else if (objProperty == 'children') {
            //            textToInsert = replaceParents(requirements, req, 'identifier')
            text_to_insert = replaceAttributesWithId('children', objectList[types.requirements.name], objData, 'identifier')
          }
          // Replacing Files Names
          else if (objProperty == 'files') {
            reqId = objId
            text_to_insert = getFilesInRequirement(objectList[types.files.name], reqId)
          }
          else if (objProperty == 'images') {
            reqId = objId
            console.log("THIS IS WORKING LIKE IT SHOULD")
            // TODO - It function here for the updater.
          }
          var new_data = text_to_insert;
          var new_url =  urlTranslator(objData, types[objType], base_path);
          var attributes = el.getAttributes(startOffset)
          delete attributes[DocumentApp.Attribute.LINK_URL]
          //console.log(`Updated: ${objId} ${new_data}`)
          //console.log(text, new_data, url)
          if(text !== new_data) {el.replaceText(text, new_data)}
          var new_length = new_data.length - text.length
          el.setLinkUrl(startOffset,endOffsetInclusive-1+new_length,new_url + `${VALI_PARAMETER_STR}${urlName}`)

          el.setAttributes(startOffset,endOffsetInclusive-1+new_length,attributes)
          attributeIndices_top = el.getTextAttributeIndices();
        }
        else{//console.log(`Not updated: ${objectName} ${new_data}`)
        }
      }

      lastLink = {
        "startOffset": startOffset,
        "endOffsetInclusive": endOffsetInclusive,
        "url": url
      };
    }
  });
}

function update_image(image, objectList, base_path){
  // go over all image elements
  var url = image.getLinkUrl();

  if (url != null) {
    if (url.includes(VALI_PARAMETER_STR)){
      objectName = url.split(VALI_PARAMETER_STR)[1]
      //TODO: Figure out a better way to define names. This is not general and is split between files.
      //Smth like a translator in the inserter
      //id = id.split('__')

      objectName = objectName.split("_");
      var objType = objectName[0].toString();
      var objId = parseInt(objectName[1]);
      var objData = objectList[objType].find(x => x['id'] === objId);
      if(objData){
        var new_data = objData['download_url']
        var attributes = image.getAttributes()
        delete attributes[DocumentApp.Attribute.LINK_URL]
        //console.log(`Updated: ${objectName} ${new_data}`)
        var new_img = UrlFetchApp.fetch(new_data).getBlob();
        var new_url =  url.split(VALI_PARAMETER_STR)[0]//urlTranslator(objData, types[objType], base_path);
        var parent = image.getParent();
        var new_image_element = parent.insertInlineImage(parent.getChildIndex(image)+1, new_img).setLinkUrl(url);
        image.removeFromParent();
        image.setLinkUrl(new_url + `${VALI_PARAMETER_STR}${urlName}`)
        new_image_element.setAttributes(attributes);
      }
      else{//console.log(`Not updated: ${objectName} ${new_data}`)
    }
    }
  }
}