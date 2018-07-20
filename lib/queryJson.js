'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

/**
 * 将json转换成urlparam参数
 * @param {json} data 
 */
var queryJSON = function queryJSON(data) {
    return Object.keys(data).map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]);
    }).join('&');
};

exports.default = queryJSON;