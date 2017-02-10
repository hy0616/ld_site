/**
 * Camera.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

var is = require('is_js'),
  Promise = require('bluebird');

module.exports = {

  tableName: 'camera',

  attributes: {
    username: {
      type: 'string',
      index: true
    },

    deviceSerial: {
      type: 'string',
      index: true
    },

    toJSON: function () {
      var obj = this.toObject();

      delete obj.updatedAt;
      delete obj.createdAt;

      return obj;
    }
  },

  /**
   * check whether the camera has been assigned to some user
   * @param deviceSerial
   * @return {*}
   */
  checkExist: function (deviceSerial) {
    return new Promise(function (resolve, reject) {
      Camera.findOne({deviceSerial: deviceSerial})
        .then(function (camera) {
          resolve(camera);
        })
        .catch(function (err) {
          reject("db error");
        });
    });
  },

  /**
   * check whether the camera belongs to some user
   * @param username
   * @param deviceSerial
   * @return {bluebird|exports|module.exports}
   */
  checkUserCameraLegal: function (username, deviceSerial) {
    return new Promise(function (resolve, reject) {
      Camera.findOne({username: username, deviceSerial: deviceSerial})
        .then(function (camera) {
          resolve(is.not.undefined(camera));
        })
        .catch(function (err) {
          reject("db error");
        });
    })
  }
};