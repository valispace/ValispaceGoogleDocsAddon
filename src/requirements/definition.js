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
  insert_value: function(element_name, property){
    var url_meta = this.nodes_list[element_name].data.url

    const insertion_data = new InsertionData(this.nodes_list[element_name].insert_value(property), url_meta, element_name, property)
    Inserter.insert(insertion_data)
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
    //It goes through the list of entries in inserted_elements
    console.log(Inserter.inserted_elements)
    console.log(Inserter.inserted_elements)
    const all_links = getAllLinks()
    for(x in all_links){
      if (all_links[x].url.includes('?from=valispace&name=')){
        id = all_links[x].url.split("?from=valispace&name=")[1]
        //TODO: Figure out a better way to define names. This is not general and is split between files.
        //Smth like a translator in the inserter
        id = id.split('__')
        console.log(`${id[0]} ${new_data}`)
        var new_data = this.nodes_list[id[0]].insert_value(id[1])

        all_links[x].text.replaceText("^.*$", new_data)
      }
    }
  }
}