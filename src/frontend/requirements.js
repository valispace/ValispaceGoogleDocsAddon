function buildRequirementTreeHtml(){
    RequirementsTree.build(true);
    html = recursiveFunction(RequirementsTree.root_nodes)
    return html
}

function recursiveFunction(object, html=''){
    //  Insert HTML text
    for (element in object){
      item = object[element]

        // If label (Folder)
        if (item.type.name == 'labels'){
            html = html.concat('<a>', 'Folder: ', String(item.data.name),'</a>')
        }
        // If Specification
        if (item.type.name == 'specifications'){
            html = html.concat('<a>', 'Specification: ', String(item.data.name),'</a>')
        }
        // If Requirement
        if (item.type.name == 'requirements'){
            if (item.data.title == null){
                reqTitle = ''
            } else {
                reqTitle = ' - '.concat(String(item.data.title))
            }
            html = html.concat('<a>', String(item.data.identifier), reqTitle,'</a>')
        }
        // If Group (Section)
        if (item.type.name == 'groups'){
            html = html.concat('<a>', 'Section: ', String(item.data.name),'</a>')
        }



      
      //  If Object.children is not empty
      if (item.children !=null){
        //  recursiveFunction
        html = recursiveFunction(item.children, html)
      } else {
        Logger.log('no child')
      }
      //  Else
      //  end?
    }
    return html
  }