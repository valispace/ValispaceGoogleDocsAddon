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
  loaded:false,
  root_nodes: [],
  nodes_list: {},
  build: function(reload_caches=false){
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
    var Labels = LabelsCache.get(project_id)
    Labels.forEach(Label => this.nodes_list["labels_" + Label.id]= new Element(Label, types.requirements.specifications.labels))
    Labels.forEach(Label => {
      //If the label has no parent, it hangs from root, else from parent label
      if(!Label.parent) this.root_nodes.push(this.nodes_list["labels_" + Label.id])
      else this.nodes_list["labels_"+Label.parent].children.push(this.nodes_list["labels_" + Label.id])
    })

    //Add specs to the tree
    var Specs = SpecificationsCache.get(project_id)
    Specs.forEach(Spec => this.nodes_list["specs_" + Spec.id]= new Element(Spec, types.requirements.specifications))
    Specs.forEach(Spec => {
      //If the spec has no label, it hangs from root, else from the label
      if(Spec.labels.length === 0) this.root_nodes.push(this.nodes_list["specs_" + Spec.id])
      else this.nodes_list["labels_"+Spec.labels[0]].children.push(this.nodes_list["specs_" + Spec.id])
    })

    //Add groups to the tree
    var Groups = GroupsCache.get(project_id)
    Groups.forEach(Group => this.nodes_list["groups_" + Group.id]= new Element(Group, types.requirements.groups))
    Groups.forEach(Group => {
      //If the group has no parent, then it hangs from the specification, else from its parent
      if(!Group.parent) this.nodes_list["specs_"+Group.specification].children.push(this.nodes_list["groups_" + Group.id])
      else this.nodes_list["groups_" + Group.parent].children.push(this.nodes_list["groups_" + Group.id])
    })

    //Add requirements to the tree
    var Requirements = RequirementsCache.get(project_id)
    Requirements.forEach(Requirement => this.nodes_list["requirements_" + Requirement.id]= new Element(Requirement, types.requirements))
    Requirements.forEach(Requirement => {
      //If the requirement has no parent, then it hangs from the specification, else from its parent
      if(!Requirement.group) this.nodes_list["specs_"+Requirement.specification].children.push(this.nodes_list["requirements_" + Requirement.id])
      else this.nodes_list["groups_" + Requirement.group].children.push(this.nodes_list["requirements_" + Requirement.id])
    })

    var Files = FilesCache.get(project_id)
    Files.forEach(Files => this.nodes_list["files_" + Files.id]= new Element(Files, types.files))
    Files.forEach(File => {
      if(File.name === "") {
        if(!this.nodes_list["requirements_"+File.object_id].data.files) this.nodes_list["requirements_"+File.object_id].data.files = []
        this.nodes_list["requirements_"+File.object_id].data.files.push(this.nodes_list['files_'+File.reference_file])
      }else if(File.object_ids){
        if(!this.nodes_list["requirements_"+File.object_id].data.files) this.nodes_list["requirements_"+File.object_id].data.files = []
        this.nodes_list["requirements_"+File.object_id].data.files.push(this.nodes_list['files_'+File.id])
    }})
    this.loaded =true
  },
  insert: function(element_name){
    table_to_insert = [
      templates.header.insert(),
    ].concat(this.nodes_list[element_name].insert().flat())
    Inserter.insert(table_to_insert.flat().filter(x => x!=null), table=true)
  },
  get_properties(element_name){
    return this.nodes_list[element_name].get_properties()
  },
  insert_value: function (element_name, property) {
    var url_meta = this.nodes_list[element_name].data.url;
    var data = this.nodes_list[element_name].insert_value(property)
    var insertion_type = 'text'
    if(property == 'image'){
      var img_url = this.nodes_list[element_name].insert_image(property)
      data = UrlFetchApp.fetch(img_url).getBlob()
      insertion_type = 'image'
    }
    const insertion_data = new InsertionData(
      data,
      url_meta,
      element_name,
      property
    );

    Inserter.insert(insertion_data, insertion_type);
  },
  search: function(prop_search, search_term){
    if(!this.loaded) return false
    for (const [key, value] of Object.entries(this.nodes_list)) {
      //TODO: Update the search logic
      if(value.data[prop_search.toLowerCase()] && value.data[prop_search.toLowerCase()].toLowerCase().includes(search_term.toLowerCase())) return key
    }
  },
  update_all: function(){//Gdocs element
    //Builds the tree, updating values from API
    this.build(true)
    //It goes through every url in the doc and update if it belongs to valispace
    this.update_text()
    this.update_images()
  },
  update_text: function(){
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
                    var new_data = RequirementsTree.nodes_list[id[0]].insert_value(id[1])
                    console.log(`Updated: ${id[0]} ${new_data}`)
                    if(el.getText() !== new_data) {el.replaceText("^.*$", new_data)}
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
              var new_data = RequirementsTree.nodes_list[id[0]].insert_image(id[1])
              console.log(`Updated: ${id[0]} ${new_data}`)
              var new_img = UrlFetchApp.fetch(new_data).getBlob();
              var parent = image.getParent();
              parent.insertInlineImage(parent.getChildIndex(image)+1, new_img).setLinkUrl(url);
              image.removeFromParent();
            }
            else{console.log(`Not updated: ${id[0]} ${new_data}`)}
          }
        }
      });
    });
  }
}