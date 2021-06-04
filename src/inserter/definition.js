function InsertionData(data, url, name, property){
  this.data = data
  this.url = url
  this.name = name
  this.property = property
}

var Inserter = {
  inserted_elements:{},
  loaded:false,
  load_inserted: function(){
    const all_links = getAllLinks()
    for(x in all_links){
      if (all_links[x].url.includes(VALI_PARAMETER_STR)){
        id = all_links[x].url.split(VALI_PARAMETER_STR)[1]
        if (!(id in this.inserted_elements)) {this.inserted_elements[id] = []}
        this.inserted_elements[id].push(all_links[x].text)
      }
    }
    this.loaded = true
    return true
  },
  insert: function(object, type='text', new_line=false){
    id = `${object.name}__${object.property}`
    if (!(id in this.inserted_elements)) {this.inserted_elements[id] = []}


    var doc=DocumentApp.getActiveDocument();
    var body = doc.getBody()
    var cursor = doc.getCursor()
    index = getCursorIndex(body, cursor)
    console.log(index)

    var el
    if (new_line){
      var text_to_insert = '\n' + object.data
    }
    else{
      var text_to_insert = object.data
    }
    el = body.insertParagraph(index, text_to_insert)


    el.setLinkUrl(object.url + `${VALI_PARAMETER_STR}${id}`)
    if(type=='text'){
      el.setForegroundColor("#000000").setUnderline(false)
    }
    if(type=='image'){
      replaceImagesURLToFile(el)
    }
    // console.log(el)
    this.inserted_elements[id].push(el)
    // var txtEl=doc.getCursor().getElement();
    // var txtOff=doc.getCursor().getOffset();
    // var pos=doc.newPosition(txtEl, txtOff + 1);
    // doc.setCursor(pos);
    // console.log(this.inserted_elements)
    return index
  },
  update: function(){
    const all_links = getAllLinks()
    for(x in all_links){
      if (all_links[x].url.includes(VALI_PARAMETER_STR)){
        id = all_links[x].url.split(VALI_PARAMETER_STR)[1]
        all_links[x].text.replaceText("^.*$", new_data)
      }
    }
  },
  //TODO: This function(get) returns two different things, better if not
  get_position: function(parent=false){
    var cursor = this.get_active_document().getCursor();
    if (cursor) {
      if(parent){
        var element = cursor.getElement();
        // while (element.getParent().getType() != DocumentApp.ElementType.BODY_SECTION) {
        //   element = element.getParent();
        // }
        return element;
      }
      return cursor
    }
    else {
      DocumentApp.getUi().alert("Could not find current position. Please click on the text where you want to add the requirement.");
      return;
    }
  },
  get_body: function(){
    this.body = this.get_active_document().getBody();
    return this.body
  },
  get_active_document: function(){
    this.document = DocumentApp.getActiveDocument();
    return this.document
  },
}


//From: https://stackoverflow.com/a/40730088
/**
 * Returns a flat array of links which appear in the active document's body.
 * Each link is represented by a simple Javascript object with the following
 * keys:
 *   - "section": {ContainerElement} the document section in which the link is
 *     found.
 *   - "isFirstPageSection": {Boolean} whether the given section is a first-page
 *     header/footer section.
 *   - "paragraph": {ContainerElement} contains a reference to the Paragraph
 *     or ListItem element in which the link is found.
 *   - "text": the Text element in which the link is found.
 *   - "startOffset": {Number} the position (offset) in the link text begins.
 *   - "endOffsetInclusive": the position of the last character of the link
 *      text, or null if the link extends to the end of the text element.
 *   - "url": the URL of the link.
 *
 * @param {boolean} mergeAdjacent Whether consecutive links which carry
 *     different attributes (for any reason) should be returned as a single
 *     entry.
 *
 * @returns {Array} the aforementioned flat array of links.
 */
function getAllLinks(mergeAdjacent=false) {
  var links = [];

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
        if (el.getType() != DocumentApp.ElementType.TEXT) {
          continue;
        }

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
    });
  });


  return links;
}

/**
 * Calls the given function for each section of the document (body, header
 * etc.). Sections are children of the DocumentElement object.
 *
 * @param {Document} doc The Document object (such as the one obtained via
 *     a call to DocumentApp.getActiveDocument()) with the sections to iterate
 *     over.
 * @param {Function} func A callback function which will be called, for each
 *     section, with the following arguments (in order):
 *       - {ContainerElement} section - the section element
 *       - {Number} sectionIndex - the child index of the section, such that
 *         doc.getBody().getParent().getChild(sectionIndex) == section.
 *       - {Boolean} isFirstPageSection - whether the section is a first-page
 *         header/footer section.
 */
function iterateSections(doc, func) {
  // get the DocumentElement interface to iterate over all sections
  // this bit is undocumented API
  var docEl = doc.getBody().getParent();

  var regularHeaderSectionIndex = (doc.getHeader() == null? -1 :
                                  docEl.getChildIndex(doc.getHeader()));
  var regularFooterSectionIndex = (doc.getFooter() == null? -1 :
                                  docEl.getChildIndex(doc.getFooter()));

  for (var i=0; i<docEl.getNumChildren(); ++i) {
    var section = docEl.getChild(i);

    var sectionType = section.getType();
    var uniqueSectionName;
    var isFirstPageSection = (
      i != regularHeaderSectionIndex &&
      i != regularFooterSectionIndex &&
      (sectionType == DocumentApp.ElementType.HEADER_SECTION ||
      sectionType == DocumentApp.ElementType.FOOTER_SECTION));

    func(section, i, isFirstPageSection);
  }
}

function decodeQueryParameters(queryString) {
  var query = {};
  var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split('=');
      query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return query;
}

function encodeQueryParameters(url, query) {
  return url + URLSearchParams(query).toString();
}