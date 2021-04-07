
function Cache(type){
  this.type = type
  this.loaded = false
  this.loaded_ids = []
  this.loaded_items = []
  this.reload = function(args){
    this.get(args, reload=true)
  }
  this.get = function(args, reload = false, filter = item => true) {
    if (this.loaded === false | reload === true){
      this.load(args)
      this.loaded=true
    }
    return this.loaded_items.filter(filter);
  }
  this.load = function(args){
    console.log('Calling API')
    var items = types[this.type].get(args)
    for (var x in items){
      items[x].url = urlTranslator(items[x], this.type)
      this.loaded_items.push(items[x])
      this.loaded_ids.push(items[x].id)
    }
  }
}

function Element(data, type, children=[]){
  this.type = type
  this.children = children
  this.data = data
}

function get_properties(element){
  return Object.keys(element.data)
}

//WIP not subsituted anywhere
function sort(callback){
  if(this.children.length === 0){
    return true
  }
  else{
    this.children.sort(callback)
    for (var x in this.children){
      this.children[x].sort(callback)
    }
    return children_inserted
  }
}
//WIP not subsituted anywhere
function insert(element){
  if(this.children.length === 0){
      return types[this.type].template.insert(this.data)
    }
    else{
      var children_inserted = [types[this.type].template.insert(this.data)]
      for (var x in this.children){
        children_inserted.push(this.children[x].insert())
      }
      return children_inserted
    }
}

function insert_all_images(element){
  var images = [];
  // console.log(element.data)
  if(element.data.files){
    for(file of element.data.files){
      if(property.includes(file.data.id)){
        images.push(file.data.download_url)
      }
    }
  }
  if(property=='image'){
    if(element.data['image_file'] || element.data['image_link']){
      images.push(element.data['image_file'] || element.data['image_link'])
    }
  }
  return images
}

function insert_value(element,property_name){
  return element.data[property_name]
}

function insert_image(element, property){
  //INSERT IMAGE:
  //Property: all_images --> Insert all images
  //Property: image
  //
  if(property == 'all_images'){return insert_all_images(element)}
  var images = [];
  if(property=='image'){
    if(element.data['image_file'] || element.data['image_link']){
      images.push(element.data['image_file'] || element.data['image_link'])
    }
  }
  else{
    // console.log(element.data)
    if(element.data.files){
      for(file of element.data.files){
        if(file.data.mimetype.includes('image') && property.includes(file.data.id)){
          images.push(file.download_url)
        }
      }
    }
  }
  return images
}
