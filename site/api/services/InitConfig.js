/**
 * Created by shuyi on 15-9-9.
 */
var Promise = require('bluebird'),
  datetime = require('./datetime'),
  _ = require('lodash'),
  later = require('later');

module.exports = {
  init: function () {
    RedisService.init();
    PushWebService.init();
    cameraInit();
  }
}

/**
 * init the camera-related
 */
function cameraInit() {
  startGetAccessToken();
}

/**
 * schedule task to get the latest accesstoken
 */
function startGetAccessToken() {
  CameraService.getLatestAccessToken()
    .then(function () {
      getCameraList();
    });
  later.date.localTime();
  later.setInterval(function () {
    CameraService.getLatestAccessToken()
      .then(function () {
        CameraService.getLatestCameraList();
      })

  }, later.parse.recur().on('02:00:00').time());
  //}, later.parse.recur().every(5).second())
}

/**
 * get the latest cameralist from the ys-server
 */
function getCameraList() {
  CameraService.getCameraList();
}