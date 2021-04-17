

function update_all_values(objectList){
  var mergeAdjacent=false;
  var doc = DocumentApp.getActiveDocument();
  var update_images=true;

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
        console.log(el.getType().name())
        if (el.getType() == DocumentApp.ElementType.TABLE ||
        el.getType() == DocumentApp.ElementType.TABLE_ROW ||
        el.getType() == DocumentApp.ElementType.TABLE_CELL ||
        el.getType() == DocumentApp.ElementType.PARAGRAPH){

          find_links(el);
        }
        if (el.getType() == DocumentApp.ElementType.TEXT) {
          update_text(el, objectList, mergeAdjacent)
        }
        if (el.getType() == DocumentApp.ElementType.INLINE_IMAGE && update_images) {
          update_image(el, objectList)
        }
      }
    };
    section.getParagraphs().forEach(find_links);
    section.getTables().forEach(find_links)
  });
}

function update_text(el, objectList, mergeAdjacent=false){
  //console.log(el.getText(), el.getLinkUrl())
  // go over all styling segments in text element
  var attributeIndices = el.getTextAttributeIndices();
  var lastLink = null;
  attributeIndices.forEach(function(startOffset, i, attributeIndices) {
    var url = el.getLinkUrl(startOffset);

    if (url != null) {
      // we hit a link
      var endOffsetInclusive = (i+1 < attributeIndices.length?
        attributeIndices[i+1]-1 : null);

      // check if this and the last found link are continuous
      if (mergeAdjacent && lastLink != null && lastLink.url == url &&
      lastLink.endOffsetInclusive == startOffset - 1) {
        // this and the previous style segment are continuous
        lastLink.endOffsetInclusive = endOffsetInclusive;
        return;
      }
      if (url.includes('?from=valispace&name=')){
        urlName = url.split("?from=valispace&name=")[1]
        //TODO: Figure out a better way to define names. This is not general and is split between files.
        //Smth like a translator in the inserter
        var objectName = urlName.split('__')
        var objProperty = objectName[1];
        objectName = objectName[0].split("_");
        var objType = objectName[0].toString();
        var objId = parseInt(objectName[1]);
        var objData = objectList[objType].find(x => x['id'] === objId);
        if(objData){
          var new_data = objData[objProperty];
          var new_url =  urlTranslator(objData, types[objType]);
          var attributes = el.getAttributes()
          delete attributes[DocumentApp.Attribute.LINK_URL]
          console.log(`Updated: ${objId} ${new_data}`)
          if(el.getText() !== new_data) {el.replaceText("^.*$", new_data)}
          el.setLinkUrl(new_url + `?from=valispace&name=${urlName}`)
          el.setAttributes(attributes)
        }
        else{console.log(`Not updated: ${objectName} ${new_data}`)}
      }

      lastLink = {
        "startOffset": startOffset,
        "endOffsetInclusive": endOffsetInclusive,
        "url": url
      };
    }
  });
}

function update_image(image, objectList){
  // go over all image elements
  var url = image.getLinkUrl();

  if (url != null) {
    if (url.includes('?from=valispace&name=')){
      objectName = url.split("?from=valispace&name=")[1]
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
        console.log(`Updated: ${objectName} ${new_data}`)
        var new_img = UrlFetchApp.fetch(new_data).getBlob();
        var new_url =  urlTranslator(objData, types[objType]);
        var parent = image.getParent();
        var new_image_element = parent.insertInlineImage(parent.getChildIndex(image)+1, new_img).setLinkUrl(url);
        image.removeFromParent();
        image.setLinkUrl(new_url + `?from=valispace&name=${urlName}`)
        new_image_element.setAttributes(attributes);
      }
      else{console.log(`Not updated: ${objectName} ${new_data}`)}
    }
  }
}