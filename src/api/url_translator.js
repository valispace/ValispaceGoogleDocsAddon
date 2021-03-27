var translations_reg = new RegExp(
  "%<.*>%"
);

var translations = {
  '':'',
  'requirements': 'project/%<project>%/specifications/requirements/%<id>%',
  'key': ''
}

var urlTranslator = function(item_data, type){
  base_url = translations[type.name]

  var result;
  while((result = translations_reg.exec(base_url)) !== null) {
    key_str = result.substring(
      result.lastIndexOf("<") + 1,
      result.lastIndexOf(">")
    );
    base_url.replace(result, item_data[key_str])
  }
  return base_url
}