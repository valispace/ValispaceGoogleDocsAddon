function InsertionData(data, url, name, property){
  this.data = data
  this.url = url
  this.name = name
  this.property = property
}

var Inserter = {
  insert: function(object, type='text', new_line=false){
    id = `${object.name}__${object.property}`

    var doc=DocumentApp.getActiveDocument();
    var body = doc.getBody()
    var cursor = doc.getCursor()
    index = getCursorIndex(body, cursor)

    var el

    var text_to_insert = object.data
    if (text_to_insert == ''){
      text_to_insert = '-'
    }
    el = body.insertParagraph(index, text_to_insert)
    el = el.getChild(0);


    el.setLinkUrl(object.url + `${VALI_PARAMETER_STR}${id}`)
    if(type=='text'){
      el.setForegroundColor("#000000").setUnderline(false)
    }
    if (new_line){
      el.insertText(0,'\n')
    }

    if(type=='image'){
      replaceImagesURLToFile(el)
    }

    return index
  },
}
