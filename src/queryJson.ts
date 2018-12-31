/**
 * 将 json 转换成 url param 参数
 * @param {json} data 
 */
var queryJSON = function (data: any) {
    return Object.keys(data).map(function(k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
    }).join('&')
}

export default queryJSON;
