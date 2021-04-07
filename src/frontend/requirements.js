var expandIcon = '<i class="expand_icon fas fa-angle-right"></i>'
var reqIcon = '<i class="tree_icon far fa-file-alt"></i>'
var sectionIcon = '<i class="tree_icon fas fa-copy"></i>'
var specificationIcon = '<i class="tree_icon fas fa-book"></i>'
var folderIcon = '<i class="tree_icon fas fa-folder"></i>'
var plusIcon = '<i class="add-element fas fa-plus"></i>'




function buildRequirementTreeHtml() {
  // RequirementsTree = getRequirementsTree()
  //RequirementsTree.build(true);
  html = RequirementsTree.get_html_tree()
  // console.log(html)
  return html
}

