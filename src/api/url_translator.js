var translations_reg = new RegExp(
  "%<\\w+>%"
);


var urlTranslator = function(item_data, type){
  var rel_path = type.url
  var base_path = PropertiesService.getUserProperties().getProperty('deployment_url')
  base_path += base_path.endsWith("/") ? "" : "/"
  // console.log(item_data, type, base_path)

  var result;
  var key_str;
  while((result = translations_reg.exec(rel_path)) !== null) {
    result = result[0]
    key_str = result.substring(2,result.length-2)
    rel_path = rel_path.replace(result, item_data[key_str])
  }
  console.log(base_path, rel_path)
  return base_path + rel_path
}