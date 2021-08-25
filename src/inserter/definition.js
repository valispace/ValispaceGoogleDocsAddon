function InsertionData(data, url, name, property){
  this.data = data
  this.url = url
  this.name = name
  this.property = property
}

var Inserter = {
  insert: function(object, type='text', new_line=false){
    id = `${object.name}__${object.property}`

    var doc=DocumentApp.getActiveDocument();
    var body = doc.getBody()
    var cursor = doc.getCursor()
    index = getCursorIndex(body, cursor)

    var el
    
    var text_to_insert = object.data
    if (text_to_insert == ''){
      text_to_insert = '-'
    }
    el = body.insertParagraph(index, text_to_insert)
    el = el.getChild(0);


    el.setLinkUrl(object.url + `${VALI_PARAMETER_STR}${id}`)
    if(type=='text'){
      el.setForegroundColor("#000000").setUnderline(false)
    }
    if (new_line){
      el.insertText(0,'\n')
    }
    
    if(type=='image'){
      replaceImagesURLToFile(el)
    }

    return index
  },
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
