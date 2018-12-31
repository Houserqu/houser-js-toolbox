"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function del(arr, callback) {
    for (let i = 0; i < arr.length; i += 1) {
        if (callback(arr[i], i) === true) {
            arr.splice(i, 1);
        }
    }
    return arr;
}
exports.default = del;
