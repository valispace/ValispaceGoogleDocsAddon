/*
* Folders in the requirements module are called Labels
* Sections in the requirements module are called Groups
*
*
*
*
*
*
*/
/**
 * Order the Requirements Objects .
 * @param  {list} RequirementsObject - List of requirements
 * @param  {string} attribute - atribute to order the requirements(e.g. Creation date)
 * @return {[type]}      [description]
 */
function orderRequirements(RequirementsObject, attribute){

}

/**
 * func desc.
 * @param  {string} param1 - desc"
 * @return
 */


var RequirementsTree = {
  cache_prefix: 'reqTree_',
  cache: PropertiesService.getUserProperties(),
  loaded: PropertiesService.getUserProperties()
          .setProperty(this.cache_prefix+'loaded', false)
          .getProperty(this.cache_prefix+'loaded') === 'true',
  root_nodes: [],
  nodes_list: {},
  loaded_and_updated: function(){
    if((this.cache.getProperty(this.cache_prefix+'loaded') === 'true')
      && this.cache.getProperty(this.cache_prefix+'loaded') === 'true'){

      }
  },
  load_or_build:function(){
    console.log("This.load:"+typeof(this.loaded))
    if(this.loaded==false){
      console.log("Not loaded")
      this.build(true)
    }
  },
  build: function(reload_caches=false){
    this.loaded = this.cache.getProperty(this.cache_prefix+'loaded') === 'true'
    var same_project = PropertiesService.getUserProperties().getProperty('projectID') === this.cache.getProperty(this.cache_prefix+'projectID')
    if(this.loaded && same_project){
      console.log('Loaded already')
      this.root_nodes = JSON.parse(this.cache.getProperty(this.cache_prefix+'root_nodes'));
      for(key of JSON.parse(this.cache.getProperty(this.cache_prefix+'nodes_keys'))){
        console.log(this.cache.getProperty(key))
        this.nodes_list[key] = JSON.parse(this.cache.getProperty(key))
      }
    }
    else{
      console.log("Not loaded, building")
      this.build_aux(reload_caches)
      this.cache.setProperty(this.cache_prefix+'root_nodes', JSON.stringify(this.root_nodes));
      for(const [key, value] of Object.entries(this.nodes_list)){
        this.cache.setProperty(key, JSON.stringify(value));
      }
      this.cache.setProperty(this.cache_prefix+'nodes_keys', JSON.stringify(Object.keys(this.nodes_list)));
      console.log(JSON.stringify(Object.keys(this.nodes_list)))
      this.cache.setProperty(this.cache_prefix+'projectID', PropertiesService.getUserProperties().getProperty('projectID'))
      this.cache.setProperty(this.cache_prefix+'loaded', this.loaded)
    }
  },
  build_aux: function(reload_caches=false){

    var project_id = PropertiesService.getUserProperties().getProperty('projectID')
    if(reload_caches){
      LabelsCache.reload(project_id)
      SpecificationsCache.reload(project_id)
      GroupsCache.reload(project_id)
      RequirementsCache.reload(project_id)
      FilesCache.reload(project_id)
    }
    //TODO: We have to create this in a for loop that loads and builds tree for every type we have
    //Add labels to the tree
    console.log("Starting Labels")
    var Labels = LabelsCache.get(project_id)
    Labels.forEach(Label => this.nodes_list["labels_" + Label.id]= new Element(Label, "labels"))
    Labels.forEach(Label => {
      //If the label has no parent, it hangs from root, else from parent label
      if(!Label.parent) this.root_nodes.push("labels_" + Label.id)
      else this.nodes_list["labels_"+Label.parent].children.push("labels_" + Label.id)
    })
    console.log("Finished Labels")
    console.log("Starting Specifications")
    //Add specs to the tree
    var Specs = SpecificationsCache.get(project_id)
    Specs.forEach(Spec => this.nodes_list["specs_" + Spec.id]= new Element(Spec, "specifications"))
    Specs.forEach(Spec => {
      //If the spec has no label, it hangs from root, else from the label
      if(Spec.labels.length === 0) this.root_nodes.push("specs_" + Spec.id)
      else this.nodes_list["labels_"+Spec.labels[0]].children.push("specs_" + Spec.id)
    })
    console.log("Finished Specifications")
    console.log("Starting Groups")

    //Add groups to the tree
    var Groups = GroupsCache.get(project_id)
    Groups.forEach(Group => this.nodes_list["groups_" + Group.id]= new Element(Group, "groups"))
    Groups.forEach(Group => {
      //If the group has no parent, then it hangs from the specification, else from its parent
      if(!Group.parent) this.nodes_list["specs_"+Group.specification].children.push("groups_" + Group.id)
      else this.nodes_list["groups_" + Group.parent].children.push("groups_" + Group.id)
    })
    console.log("Finished Groups")
    console.log("Starting Requirements")

    //Add requirements to the tree
    var Requirements = RequirementsCache.get(project_id)
    Requirements.forEach(Requirement => this.nodes_list["requirements_" + Requirement.id]= new Element(Requirement, "requirements"))
    Requirements.forEach(Requirement => {
      //If the requirement has no parent, then it hangs from the specification, else from its parent
      if(!Requirement.group) this.nodes_list["specs_"+Requirement.specification].children.push("requirements_" + Requirement.id)
      else this.nodes_list["groups_" + Requirement.group].children.push("requirements_" + Requirement.id)
    })
    Requirements.forEach(Requirement => {
      var req = this.nodes_list["requirements_" + Requirement.id]
      if(!req.data['title']) {req.data['title']='-'}
      req.data['parents_id'] = req.data['parents']
      req.data['children_id'] = req.data['children']
      req.data['parents'] = []
      req.data['children'] = []
      for(parent of req.data['parents_id']){
        if (this.nodes_list["requirements_" + parent]){
          req.data['parents'].push(this.nodes_list["requirements_" + parent].data.identifier)
        }
      }
      for(child of req.data['children_id']){
        if (this.nodes_list["requirements_" + child]){
          req.data['children'].push(this.nodes_list["requirements_" + child].data.identifier)
        }
      }
      if (req.data['group']){
        req.data['section'] = this.nodes_list["groups_" + req.data['group']].data.name
      }
    })
    console.log("Finished Requirements")
    console.log("Starting Files")

    var Files = FilesCache.get(project_id)
    Files.forEach(File => this.nodes_list["files_" + File.id]= new Element(File, "files"))
    Files.forEach(File => {
      if(this.nodes_list["requirements_"+File.object_id]){
        if(!this.nodes_list["requirements_"+File.object_id].data.hasOwnProperty("files")) {
          this.nodes_list["requirements_"+File.object_id].data.files = []
          this.nodes_list["requirements_"+File.object_id].data.files_data = []}
        var from;
        if(File.file_type === 2) {
          from = File.id
        }
        if(File.file_type === 3){
          from = File.reference_file
        }
        if(File.file_type === 1 && File.object_id !== project_id){
          from = File.id
        }
        var file_name = this.nodes_list['files_'+from].data.extension
                        ? this.nodes_list['files_'+from].data.name + this.nodes_list['files_'+from].data.extension
                        : this.nodes_list['files_'+from].data.name
        this.nodes_list["requirements_"+File.object_id].data.files.push(file_name)
        this.nodes_list["requirements_"+File.object_id].data.files_data.push(this.nodes_list['files_'+from])
      }
    })
    console.log("Finished Files")

    this.loaded =true
  },
  insert: function(element_name){
    this.load_or_build()
    table_to_insert = [
      templates.header.insert(),
    ].concat(insert(element_name).flat())
    Inserter.insert(table_to_insert.flat().filter(x => x!=null), table=true)
  },
  get_properties(element_name){
    this.load_or_build()
    return get_properties(this.nodes_list[element_name])
  },
  insert_value: function (element_name, property) {
    this.load_or_build()
    var url_meta = this.nodes_list[element_name].data.url;
    var data_array = [insert_value(this.nodes_list[element_name], property)]
    var insertion_type = 'text'
    if(property.includes('image')){
      var img_urls = insert_image(this.nodes_list[element_name], property)
      for(x in img_urls){
        data_array[x] = UrlFetchApp.fetch(img_urls[x]).getBlob()
      }
      insertion_type = 'image'
    }
    // console.log(data_array.length)
    for(data of data_array){
      var insertion_data = new InsertionData(
        data,
        url_meta,
        element_name,
        property
      );
      Inserter.insert(insertion_data, insertion_type);
    }
  },
  search: function(prop_search, search_term){
    this.load_or_build()
    if(!this.loaded) return false
    for (const [key, value] of Object.entries(this.nodes_list)) {
      //TODO: Update the search logic
      if(value.data[prop_search.toLowerCase()] && value.data[prop_search.toLowerCase()].toLowerCase().includes(search_term.toLowerCase())) return key
    }
  },

  update_all: function(){//Gdocs element
    this.load_or_build()
    //Builds the tree, updating values from API
    //It goes through every url in the doc and update if it belongs to valispace
    this.update_text()
    this.update_images()
  },
  update_text: function(){
    this.load_or_build()
    var links = [];
    var mergeAdjacent=false;
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
          if (el.getType() == DocumentApp.ElementType.TEXT) {


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
                if (url.includes('?from=valispace&name=')){
                  id = url.split("?from=valispace&name=")[1]
                  //TODO: Figure out a better way to define names. This is not general and is split between files.
                  //Smth like a translator in the inserter
                  id = id.split('__')
                  if(RequirementsTree.nodes_list[id[0]]){
                    var new_data = insert_value(RequirementsTree.nodes_list[id[0]],id[1])
                    var new_url =  urlTranslator(RequirementsTree.nodes_list[id[0]].data, types[RequirementsTree.nodes_list[id[0]].type])
                    var attributes = el.getAttributes()
                    delete attributes[DocumentApp.Attribute.LINK_URL]
                    console.log(`Updated: ${id[0]} ${attributes}`)
                    if(el.getText() !== new_data) {el.replaceText("^.*$", new_data)}
                    el.setLinkUrl(new_url + `?from=valispace&name=${id.join('__')}`)
                    el.setAttributes(attributes)
                  }
                  else{console.log(`Not updated: ${id[0]} ${new_data}`)}
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
        }
      });
    });
  },
  update_images: function(){
    this.load_or_build()
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

      section.getImages().forEach(function(image) {
        // go over all image elements
        var url = image.getLinkUrl();

        if (url != null) {
          if (url.includes('?from=valispace&name=')){
            id = url.split("?from=valispace&name=")[1]
            //TODO: Figure out a better way to define names. This is not general and is split between files.
            //Smth like a translator in the inserter
            id = id.split('__')
            if(RequirementsTree.nodes_list[id[0]]){
              var new_data = insert_image(RequirementsTree.nodes_list[id[0]], id[1])
              var attributes = image.getAttributes()
              delete attributes[DocumentApp.Attribute.LINK_URL]
              console.log(`Updated: ${id[0]} ${attributes}`)
              var new_img = UrlFetchApp.fetch(new_data).getBlob();
              var new_url =  urlTranslator(RequirementsTree.nodes_list[id[0]].data, types[RequirementsTree.nodes_list[id[0]].type])
              var parent = image.getParent();
              var new_image_element = parent.insertInlineImage(parent.getChildIndex(image)+1, new_img).setLinkUrl(url);
              image.removeFromParent();
              image.setLinkUrl(new_url + `?from=valispace&name=${id.join('__')}`)
              new_image_element.setAttributes(attributes);
            }
            else{console.log(`Not updated: ${id[0]} ${new_data}`)}
          }
        }
      });
    });
  },
  get_html_tree: function(){
    this.load_or_build()
    var html = '<ul class="reqTreeMain">'
    for(root_node of this.root_nodes){
      html = html.concat(generate_html_tree(root_node, this.nodes_list))
    }
    html = html.concat('</ul>')
    return html
  }
}

function generate_html_tree(current_id, nodes, html=''){
  current_node = nodes[current_id]
  html = html.concat(types[current_node.type].tree(current_node.data))
  if(current_node.children.length !== 0){
    html = html.concat('<div class="nested dropdown-content" id="children_', types[current_node.type].name,'_', current_node.data.id, '">')
    for (var x of current_node.children){
      html = generate_html_tree(x, nodes, html)
    }
    html = html.concat('</div>')
  }
  return html
}