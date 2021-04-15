

function update_all_values(objectList){
  update_text(objectList);
  // update_iamges(objectList);

}

function update_text(objectList){
  var links = [];
  var mergeAdjacent=false;
  var doc = DocumentApp.getActiveDocument();


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

    section.getParagraphs().forEach(function(par) {
      // skip empty paragraphs
      if (par.getNumChildren() == 0) {
        return;
      }

      // go over all text elements in paragraph / list-item
      for (var el=par.getChild(0); el!=null; el=el.getNextSibling()) {
        if (el.getType() == DocumentApp.ElementType.TEXT) {


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
                  console.log(`Updated: ${objId} ${attributes}`)
                  if(el.getText() !== new_data) {el.replaceText("^.*$", new_data)}
                  el.setLinkUrl(new_url + `?from=valispace&name=${urlName}`)
                  el.setAttributes(attributes)
                }
                else{console.log(`Not updated: ${objectName} ${new_data}`)}
              }

              lastLink = {
                "section": section,
                "isFirstPageSection": isFirstPageSection,
                "paragraph": par,
                "textEl": el,
                "startOffset": startOffset,
                "endOffsetInclusive": endOffsetInclusive,
                "url": url
              };

              links.push(lastLink);
            }
          });
        }
      }
    });
  });
}

function update_images(objectList){
  var doc = DocumentApp.getActiveDocument();


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

    section.getImages().forEach(function(image) {
      // go over all image elements
      var url = image.getLinkUrl();

      if (url != null) {
        if (url.includes('?from=valispace&name=')){
          id = url.split("?from=valispace&name=")[1]
          //TODO: Figure out a better way to define names. This is not general and is split between files.
          //Smth like a translator in the inserter
          id = id.split('__')
          if(RequirementsTree.nodes_list[id[0]]){
            var new_data = RequirementsTree.nodes_list[id[0]].insert_image(id[1])
            var attributes = image.getAttributes()
            delete attributes[DocumentApp.Attribute.LINK_URL]
            console.log(`Updated: ${id[0]} ${attributes}`)
            var new_img = UrlFetchApp.fetch(new_data).getBlob();
            var new_url =  urlTranslator(RequirementsTree.nodes_list[id[0]].data, RequirementsTree.nodes_list[id[0]].type)
            var parent = image.getParent();
            var new_image_element = parent.insertInlineImage(parent.getChildIndex(image)+1, new_img).setLinkUrl(url);
            image.removeFromParent();
            image.setLinkUrl(new_url + `?from=valispace&name=${id.join('__')}`)
            new_image_element.setAttributes(attributes);
          }
          else{console.log(`Not updated: ${id[0]} ${new_data}`)}
        }
      }
    });
  });
}