function deleteToken(){
  response = PropertiesService.getUserProperties().deleteProperty('access_token')
}

 function c_temp_test() {
   valispaceAskToken("https://staging.valispace.com", "", "")
   PropertiesService.getUserProperties().setProperty('deployment_url', 'https://staging.valispace.com');
   PropertiesService.getUserProperties().setProperty('projectID', '24');
   RequirementsTree.build(true);
   html = recursiveFunction(RequirementsTree.root_nodes)
   Logger.log(html)
 }

 function recursiveFunction_test(object, html=''){
   //  Insert HTML text
   for (element in object){
     item = object[element]
       // TODO add Id and classes to each type
       // TODO Should this be Generic?
       // If label (Folder)
       if (item.type.name == 'labels'){
           html = html.concat('<a class="reqClicable">', 'Folder: ', String(item.data.name),'</a>')
       }
       // If Specification
       if (item.type.name == 'specifications'){
           html = html.concat('<a class="reqClicable">', 'Specification: ', String(item.data.name),'</a>')
       }
       // If Requirement
       if (item.type.name == 'requirements'){
           if (item.data.title == null){
               reqTitle = ''
           } else {
               reqTitle = ' - '.concat(String(item.data.title))
           }
           html = html.concat('<a class="requirement" id="', item.data.id,'">', String(item.data.identifier), reqTitle,'</a>')
       }
       // If Group (Section)
       if (item.type.name == 'groups'){
           html = html.concat('<a class="reqClicable">', 'Section: ', String(item.data.name),'</a>')
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



// function c_connect_temp() {
//   valispaceAskToken("https://staging.valispace.com", "admin", "vali")
// }

// function c_checkValispaceConnexion() {
//   Logger.log(checkValispaceConnexion())
// }


// function c_checkValispaceConnexion2() {
//   PropertiesService.getUserProperties().setProperty('deployment_url', 'https://staging.valispace.com')
//   Logger.log(checkValispaceConnexion())
// }

// function seeUserProperties() {
//   var scriptProperties = PropertiesService.getUserProperties();
//   var data = scriptProperties.getProperties();
//   for (var key in data) {
//     Logger.log('Key: %s, Value: %s', key, data[key]);
//   }
// }

// function deleteUserProperties(){
//   PropertiesService.getUserProperties().deleteAllProperties();
// }

// function disconnect(){

// }