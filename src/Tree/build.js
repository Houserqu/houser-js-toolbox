import data from  './data.json';

/**
 * 节点构造方法
 * @param {Int} id 节点id
 * @param {String} name 节点名称
 */
var Node = function(id, name){
  this.id = id;
  this.name = name;
}

/**
 * 创建树
 * @param {Array} list 所有节点列表
 * @param {*} rootId 
 */
var build = function(list, rootId) {
  // 定义根节点
  var tree = new Node(rootId, 'root');

  findChild(tree, list);

  console.log(JSON.stringify(tree));
  return tree;
}

/**
 * 递归查找子节点
 * @param {Node} node 节点对象
 * @param {Array} list 所有节点列表
 */
var findChild = function(node, list){
  for(var i = 0; i < list.length; i++){
    if(list[i].parentId == node.id){
      // 判断是否存在children
      if (!node.hasOwnProperty("children")){
        node.children = [];
      }

      var newNode = new Node(list[i].id, list[i].name);
      node.children.push(newNode);
      //list.splice(i,1);
      findChild(newNode, list);
    }
  }
}

export default build;


