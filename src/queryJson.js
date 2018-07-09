
/**
 * 将json转换成urlparam参数
 * @param {json} data 
 */
var queryJSON = function (data) {
    return Object.keys(data).map(function(k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
    }).join('&')
}

export default queryJSON;
