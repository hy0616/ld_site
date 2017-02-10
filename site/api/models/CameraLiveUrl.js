/**
 * CameraLiveUrl.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

var Promise = require('bluebird');

module.exports = {

  tableName: 'camera_liveurl',

  attributes: {
    deviceSerial: {
      type: 'string',
      index: true
    },

    liveurl:{
      type:'string',
      unique:true
    },

    toJSON: function () {
      var obj = this.toObject();

      delete obj.updatedAt;
      delete obj.createdAt;

      return obj;
    }
  },

  /**
   * check whether the camera has existed
   * @param deviceSerial
   * @return {*}
   */
  checkCameraExist: function (deviceSerial) {
    return new Promise(function (resolve, reject) {
      CameraLiveUrl.findOne({deviceSerial: deviceSerial})
        .then(function (camera) {
          resolve(camera);
        })
        .catch(function (err) {
          reject("db error");
        });
    });
  },

  /**
   * check whether the liveurl has been assigned to some camera
   * @param liveUrl
   * @return {bluebird|exports|module.exports}
   */
  checkLiveUrlExist: function (liveUrl) {
    return new Promise(function (resolve, reject) {
      CameraLiveUrl.findOne({liveurl: liveUrl})
        .then(function (camera) {
          resolve(camera);
        })
        .catch(function (err) {
          reject('db error');
        })
    })
  }
};

