"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Node = function (id, name) {
    this.id = id;
    this.name = name;
};
var build = function (list, rootId) {
    var tree = new Node(rootId, 'root');
    findChild(tree, list);
    console.log(JSON.stringify(tree));
    return tree;
};
var findChild = function (node, list) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].parentId == node.id) {
            if (!node.hasOwnProperty("children")) {
                node.children = [];
            }
            var newNode = new Node(list[i].id, list[i].name);
            node.children.push(newNode);
            findChild(newNode, list);
        }
    }
};
exports.default = build;
