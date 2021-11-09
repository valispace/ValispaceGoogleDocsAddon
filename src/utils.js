function sortNameAlphabeticaly(a, b) {
    a_ = a.name.toUpperCase()
    b_ = b.name.toUpperCase()
    if (a_ == b_)
      return 0;
    if (a_ < b_)
      return -1;
    if (a_ > b_)
      return 1;
};

var urlTranslator = function(item_data, type, base_path){
  var rel_path = type.url
  base_path += base_path.endsWith("/") ? "" : "/"

  var key_str;
  rel_path = rel_path.map(part=>{
    if (part.startsWith('%')){
      key_str = part.substring(1)
      return item_data[key_str]
    }
    return part
  })
  return base_path + rel_path.join('/')
}

var VALI_PARAMETER_STR = "?from=valispace&name="

// TODO : !!! Review possible usage !!!
// var parseValiURL = function(url){
//   var urlSplit = url.split(VALI_PARAMETER);
//   var url = urlSplit[0];
//   var objectSplit = urlSplit[1].split('__');
//   var property = objectSplit[1];
//   objectSplit = objectSplit[0].split('_');
//   var type = objectSplit[0].toString();
//   var id = parseInt(objectSplit[1]);
//   return url, type, id, property;
// }
// 
// var encodeValiURL = function(type, id, property){
// 
//   return
// }


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

			
function getSavedDeployment(){
  return PropertiesService.getUserProperties().getProperty('savedDeployment')
}
function setSavedDeployment(deployment){
  PropertiesService.getUserProperties().setProperty('savedDeployment', deployment)
}
function getSavedUsername(){
  return PropertiesService.getUserProperties().getProperty('savedUsername')
}
function setSavedUsername(savedusername){
  PropertiesService.getUserProperties().setProperty('savedUsername', savedusername)
}

function getCurrentVersion(){
  return releaseVersion
}