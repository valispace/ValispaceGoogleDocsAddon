
function Template(){
  this.format = {}
  this.structure = {}
  this.insert = function(data){
    if(data!== undefined && data!==null && Object.keys(this.structure).length > 0){
      var temp_struct = JSON.stringify(this.structure)
      for (const [key, value] of Object.entries(data)) {
        temp_struct = temp_struct.replace(`#${key.toLowerCase()}#`, `${value}`);
      }
      return JSON.parse(temp_struct)
    }
    else if (Object.keys(this.structure).length > 0){
      return this.structure
    }
    else {
      return null
    }
  }
}


var templates = {
  header: new Template(),
  folder:new Template(),
  specification:new Template(),
  section:new Template(),
  requirement:new Template(),
}

types.requirements.template = templates.requirement
types.specifications.template = templates.specification
types.labels.template = templates.folder
types.groups.template = templates.section