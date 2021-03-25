
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
    var items = this.type.get(args)
    for (var x in items){
      //items[x].url = urlTranslator(items[x], this.type)
      this.loaded_items.push(items[x])
      this.loaded_ids.push(items[x].id)
    }
  }
}

function Element(data, type, children=[]){
  this.type = type
  this.children = children
  this.data = data
  this.sort = function(callback){
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
  this.insert = function (){
    if(this.children.length === 0){
      return this.type.template.insert(this.data)
    }
    else{
      var children_inserted = [this.type.template.insert(this.data)]
      for (var x in this.children){
        children_inserted.push(this.children[x].insert())
      }
      return children_inserted
    }
  }
  this.get_properties = function (){
    return Object.keys(this.data)
  }
  this.insert_image = function(){
    return this.data['image_file'] || this.data['image_link']
  }
  this.insert_value = function (propertie_name){
    return this.data[propertie_name]
  }
  //For now it doesn't have an use. Future: Build a tree for frontend
  this.tree = function(){
    if(this.children.length === 0){
      return this.type.tree(this.data)
    }
    else{
      var children_inserted = []
      for (var x in this.children){
        children_inserted.push(this.children[x].tree())
      }
      return children_inserted
    }
  }
}
