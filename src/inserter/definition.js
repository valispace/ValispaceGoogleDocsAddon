var Inserter = {
  insert: function(object, table=false){
    var index = this.get_position(table)
    //TODO: This function returns two different things, better if not
    if (table) index.appendTable(object)
    else index.insertText(object);

  },
  get_position: function(table=false){
    var cursor = this.get_active_document().getCursor();
    if (cursor) {
      if(table){
        var element = cursor.getElement();
        while (element.getParent().getType() != DocumentApp.ElementType.BODY_SECTION) {
          element = element.getParent();
        }
        return this.get_body.getChildIndex(element);
      }
      return cursor
    }
    else {
      DocumentApp.getUi().alert("Could not find current position. Please click on the text where you want to add the requirement.");
      return;
    }
  },
  get_body: function(){
    if (!this.body){
      this.body = this.get_active_document().getBody();
    }
    return this.body
  },
  get_active_document: function(){
    if (!this.document){
      this.document = DocumentApp.getActiveDocument();
    }
    return this.document
  },
}