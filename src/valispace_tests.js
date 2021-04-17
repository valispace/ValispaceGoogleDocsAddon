// function temp_test(){
//   connect_temp();
//   PropertiesService.getUserProperties().setProperty('deployment_url', 'https://staging.valispace.com');
//   PropertiesService.getUserProperties().setProperty('projectID', '24');
//   RequirementsTree.build();
//   var insterdoc = DocumentApp.openById('1W8B9kCA7gVzyJ7Uh15KaOysDrXpTwrs0TAdAOHFwKkk').getBody();
//   //var templatedoc = DocumentApp.openById('1bDQClCWVcvzPARYl5ohGvBgZlQ519NGGCStqizzK-bU');

//   templates.header.structure = [
//     ['ID', 'Requirement']
//   ]

//   templates.requirement.structure = [
//     ['#id#', '#text#']
//   ]
//   templates.specification.structure = [
//     ['#name#', '']
//   ]

//   var results = RequirementsTree.search('identifier', 'SPC-030')
//   console.log(urlTranslator(RequirementsTree.nodes_list[results].data, RequirementsTree.nodes_list[results].type))
//   //appendedTable = insterdoc.appendTable(results)
  
//   //var reqTableItem = templatedoc.getChild(1).copy();
//    //reqTableItem
//   //Logger.log(reqTableItem.getType());
// }

// function connect_temp(){
  
// }


// function checkValispaceConnexion2(){
//   PropertiesService.getUserProperties().setProperty('deployment_url', 'https://staging.valispace.com')
//   Logger.log(checkValispaceConnexion())
// }
