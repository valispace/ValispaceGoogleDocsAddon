


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