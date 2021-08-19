
function update_all_values2(){
    var mergeAdjacent=false;
    var doc = DocumentApp.openById('1bow842D02eRGwVdyVHZTJkoVKUW35s0aM9P-GGQwJs8');
    var images = [];
    
    var update_images=true;
  
    var base_path = PropertiesService.getUserProperties().getProperty('deployment_url')
    iterateSections2(doc, function(section, sectionIndex, isFirstPageSection) {
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
  //        if (el.getType() == DocumentApp.ElementType.TABLE ||
  //        el.getType() == DocumentApp.ElementType.TABLE_ROW ||
  //        el.getType() == DocumentApp.ElementType.TABLE_CELL ||
  //        el.getType() == DocumentApp.ElementType.PARAGRAPH){
  //
  //          find_links(el);
  //        }
  //        if (el.getType() == DocumentApp.ElementType.TEXT) {
  //          update_text(el, objectList, mergeAdjacent, base_path)
  //        }
          if (el.getType() == DocumentApp.ElementType.INLINE_IMAGE && update_images) {
            console.log(el.getLinkUrl())
          }
        }
      };
      section.getParagraphs().forEach(find_links);
      section.getTables().forEach(find_links)
    });
  }
  
  
  /**
   * Calls the given function for each section of the document (body, header, 
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
  function iterateSections2(doc, func) {
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