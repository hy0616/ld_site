/**
 * Created by xieyiming on 15-3-11.
 */

var request = require('request');
var Q = require('q');


var SITE_ROOT = 'http://a1.easemob.com/rstest/chatroom/';

var AKStr = 'q1GfQENlWpZzEq6ZyzQyl06D'
var CoorByIpURL = "http://api.map.baidu.com/location/ip"
var AddressByCoorURL = "http://api.map.baidu.com/geocoder/v2/"

//
//var TOKEN = 'YWMtWGTVvoZgEeSPjYFPAu0GggAAAUuQSXayOPDCkTsGWw6pekWk-3V1gRk5cyE'
//
//var DEFAULT_HEADERS = {
//  'User-Agent': 'Mozilla/5.0 (X11; Linux i686; rv:7.0.1) Gecko/20100101 Firefox/7.0.1',
//  'Accept': 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
//  'Accept-Language': 'en-us,en,zh;q=0.5',
//  'Accept-Encoding': 'gzip, deflate',
//  'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.7',
//  'Authorization': 'Bearer ' + TOKEN,
//  // 'Connection': 'keep-alive',
//  'Cache-Control': 'max-age=0'
//};

// 请求设备信息
// 如果信息中有 lat/lng 则不调用 BaiduSDK
// 如果没有（第一次）则调用 BaiduSDK
// 可以手动、自动定位

module.exports = {
  //todo: recheck the token valied

  getCoorByIp: function (ip) {
    var query = CoorByIpURL + "?" + "ak=" + AKStr + "&ip=" + ip + "&coor=bd09ll"
    var deferred = Q.defer()

    request(query, function (error, response, data) {
      if (!error && response.statusCode == 200) {
        return deferred.resolve(JSON.parse(data))
//        return deferred.resolve(data)

      } else {
        return deferred.reject(error)
      }
    })

    return deferred.promise
  },


  getAddressByCoor: function (lat, lng) {
    var query = AddressByCoorURL+"?"+"ak="+AKStr+"&location="+lat+","+lng+"&output=json"

    //console.log("AddressByCoorURL: ", query)

    var deferred = Q.defer()

    request(query, function (error, response, data) {
      if (!error && response.statusCode == 200) {
        return deferred.resolve(JSON.parse(data))
//        return deferred.resolve(data)

      } else {
        return deferred.reject(error)
      }
    })

    return deferred.promise
  }

};




