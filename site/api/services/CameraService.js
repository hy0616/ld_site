/**
 * Created by shuyi on 16-3-28.
 */
var url = require('url'),
  request = require('request'),
  Q = require('q'),
  _ = require('lodash'),
  Promise = require('bluebird'),
  md5 = require('md5');

var camera_config = sails.config.camera_config;

var accessToken = undefined;
var cameraList = undefined;

var pageSize = 500;

module.exports = {
  /**
   * get the accessToken
   * @return {bluebird|exports|module.exports}
   */
  getAccessToken: function () {
    return new Promise(function (resolve, reject) {
      getAccessTokenInner().then(function (token) {
        resolve(token);
      })
    })
  },

  /**
   * used by the schedule task to get the lastest accesstoken
   */
  getLatestAccessToken: function () {
    return new Promise(function (resolve, reject) {
      getAccessTokenFromServer().then(function (value) {
        accessToken = value.result.data.accessToken;
        resolve();
      })
    })
  },

  /**
   * get the cameraList
   * @return {*}
   */
  getCameraList: function () {
    return new Promise(function (resolve, reject) {
      getCameraListInner().then(function (list) {
        resolve(list);
      })
    })
  },

  /**
   * used to get the latest cameraList by the admin
   * @return {bluebird|exports|module.exports}
   */
  getLatestCameraList: function () {
    return new Promise(function (resolve, reject) {
      getAccessTokenInner().then(function (accessToken) {
        cameraList = {};
        getCameraListrecursive().then(function () {
          resolve(cameraList);
        })
      })
    })
  },

  /**
   * check whether the deviceSerial user added is legal
   * @param deviceSerial
   * @return {bluebird|exports|module.exports}
   */
  checkCameraLegal: function (deviceSerial) {
    return new Promise(function (resolve, reject) {
      getCameraListInner().then(function (list) {
        resolve(_.includes(_.keys(list), deviceSerial));
      })
    })
  },
}

/**
 * get the accessToken
 * @return {bluebird|exports|module.exports}
 */
function getAccessTokenInner() {
  return new Promise(function (resolve, reject) {
    if (undefined === accessToken) {
      getAccessTokenFromServer().then(function (value) {
        accessToken = value.result.data.accessToken;
        resolve(accessToken);
      })
    } else {
      resolve(accessToken);
    }
  })
}

/**
 * get the cameraList
 * @return {bluebird|exports|module.exports}
 */
function getCameraListInner() {
  return new Promise(function (resolve, reject) {
    if (undefined === cameraList) {
      getAccessTokenInner().then(function (accessToken) {
        cameraList = {};
        getCameraListrecursive().then(function () {
          resolve(cameraList);
        })
      })
    } else {
      resolve(cameraList);
    }
  })
}

/**
 * get the cameralist recursive
 */
function getCameraListrecursive() {
  return new Promise(function (resolve, reject) {
    getCameraListFromServer(0).then(function (value) {
      var total = value.result.page.total;
      var pageNum = Math.ceil(total / pageSize);
      _.forEach(value.result.data, function (camera) {
        cameraList[camera.deviceSerial] = camera;
      });
      if (undefined !== pageNum && pageNum > 1) {
        var arr = [];
        for (var i = 1; i < pageNum; i++) {
          arr.push(i);
        }
        Promise.map(arr, function (flag) {
          return new Promise(function (resolve, reject) {
            getCameraListFromServer(flag).then(function (value) {
              _.forEach(value.result.data, function (camera) {
                cameraList[camera.deviceSerial] = camera;
              });
              resolve();
            })
          })
        }).then(function () {
          resolve();
        })
      } else {
        resolve();
      }
    })
  })
}

/**
 * get the latest accessToken
 * @return {*}
 */
function getAccessTokenFromServer() {

  var params = {
    phone: camera_config.register_phone,
    method: 'token/getAccessToken',
    time: parseInt(datetime.getLocalTimeStamp() / 1000)
  }

  var sign = generateTokenSign(params);

  var options = {
    url: camera_config.api_rootpath,
    method: 'POST',
    headers: {},
    body: {
      id: '1000',
      'system': {
        key: camera_config.app_key,
        sign: sign,
        time: params.time,
        ver: camera_config.version
      },
      method: params.method,
      'params': {
        phone: params.phone
      }
    },
    json: true
  };

  return _doRequest(options);
}

/**
 * get the latest cameraList
 * @return {*}
 */
function getCameraListFromServer(pageStart) {
  var params = {
    accessToken: accessToken,
    pageSize: pageSize,
    pageStart: pageStart,
    method: 'cameraList',
    time: parseInt(datetime.getLocalTimeStamp() / 1000)
  }
  var sign = generateCameraListSign(params);
  var options = {
    url: camera_config.api_rootpath,
    method: 'POST',
    headers: {},
    body: {
      id: '1001',
      'system': {
        key: camera_config.app_key,
        sign: sign,
        time: params.time,
        ver: camera_config.version
      },
      method: params.method,
      'params': {
        accessToken: params.accessToken,
        pageSize: params.pageSize,
        pageStart: params.pageStart
      }
    },
    json: true
  };

  return _doRequest(options);
}

/**
 * using http to request the leancloud
 * @param options
 * @return {*}
 * @private
 */
function _doRequest(options) {
  return new Promise(function (resolve, reject) {
    request(options, function (err, res, body) {
      //options.timeout = 60000;
      if (!err && res.statusCode == 200) {
        resolve(body);
      } else {
        if (_.isUndefined(res)) {
          //throw (_T('Error.Common.NetWork.Timeout'));
        }

        reject(body);
      }
    });
  })
}

/**
 * generate the token sign
 * @param params
 * @return {*}
 */
function generateTokenSign(params) {
  var str = 'phone:' + params.phone + ',method:' + params.method + ',time:'
    + params.time + ',secret:' + camera_config.secret_key;
  return md5(str);
}

/**
 * generate the cameralist sign
 * @param params
 * @return {*}
 */
function generateCameraListSign(params) {
  var str = 'accessToken:' + params.accessToken + ',pageSize:' + params.pageSize
    + ',pageStart:' + params.pageStart + ',method:' + params.method + ',time:'
    + params.time + ',secret:' + camera_config.secret_key;
  return md5(str);
}