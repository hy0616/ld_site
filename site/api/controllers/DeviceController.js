/**
 * DeviceController
 *
 * @description :: Server-side logic for managing Devices
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require('bluebird'),
  _ = require('lodash');

module.exports = {
  updateAlias: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else if (null === req.params['id']) {
          res.json(sails.config.errorcode.E506.code, sails.config.errorcode.E506.detail);
        } else {
          var alias = req.body.alias,
            deviceSn = req.params['id'];
          DeviceService.updateAlias(deviceSn, alias)
            .then(function (result) {
              res.json('200', result);
            });
        }
      });
  },

  getDeviceInfo: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else if (null === req.params['id']) {
          res.json(sails.config.errorcode.E506.code, sails.config.errorcode.E506.detail);
        } else {
          var deviceSn = req.params['id'];
          RedisService.getLatestDeviceData(deviceSn,username)
            .then(function (result) {
              res.json('200', result);
            })
        }
      });
  }
};

