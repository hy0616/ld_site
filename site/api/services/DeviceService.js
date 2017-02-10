/**
 * Created by shuyi on 15-9-23.
 */
var Promise = require('bluebird');
var datetime = require('./datetime');
var http = require('http');

module.exports = {
  updateAlias: function (deviceSn, alias) {
    return new Promise(function (resolve, reject) {
      var req_data = {};
      req_data.meta = {
        type: 'update_device_alias',
        time: datetime.getLocalString(),
        version: ''
      };
      req_data.data = {
        alias: alias,
        deviceSn: deviceSn
      }

      //result is 'OK' or 'Failed'
      HttpClient.createHttpClient(req_data).then(function (result) {
        resolve(result);
      });
    });
  }
}