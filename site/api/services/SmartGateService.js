/**
 * Created by shuyi on 15-9-23.
 */
var Promise = require('bluebird');
var datetime = require('./datetime');
var http = require('http');

module.exports = {
  updateAlias: function (smartGateSn, alias) {
    return new Promise(function (resolve, reject) {
      var req_data = {};
      req_data.meta = {
        type: 'update_smartgate_alias',
        time: datetime.getLocalString(),
        version: ''
      };
      req_data.data = {
        alias: alias,
        smartGateSn: smartGateSn
      }

      //result is 'OK' or 'Failed'
      HttpClient.createHttpClient(req_data).then(function (result) {
        resolve(result);
      });
    });
  },

  /**
   * get the cameras of some smartgate
   * @param smartGateSn
   * @param devType
   * @return {bluebird|exports|module.exports}
   */
  getCameras: function (smartGateSn,devType) {
    return new Promise(function (resolve, reject) {
      Device.find({owner:smartGateSn, dev_type:devType})
        .then(function (devices) {
          resolve(devices);
        })
    })
  }
}