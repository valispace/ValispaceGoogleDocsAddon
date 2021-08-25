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
  
  var parseValiURL = function(url){
    var urlSplit = url.split(VALI_PARAMETER);
    var url = urlSplit[0];
    var objectSplit = urlSplit[1].split('__');
    var property = objectSplit[1];
    objectSplit = objectSplit[0].split('_');
    var type = objectSplit[0].toString();
    var id = parseInt(objectSplit[1]);
    return url, type, id, property;
  }
  
  var encodeValiURL = function(type, id, property){
  
    return
  }