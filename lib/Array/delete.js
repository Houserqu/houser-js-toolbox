"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * 在原数组上删除指定项
 * @param {Array} arr 
 * @param {Function} callback 每个项的操作方法,返回true表示删除该项
 */
var del = function del(arr, callback) {
  for (var i = 0; i < arr.length; i += 1) {
    if (callback(arr[i], i) === true) {
      arr.splice(i, 1);
    }
  }
};

exports.default = del;