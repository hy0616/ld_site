/**
 * AnalysisController
 *
 * @description :: Server-side logic for managing analyses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require('bluebird'),
  _ = require('lodash');

module.exports = {
  /**
   * get the history-monitoring-value
   * compulsory choose the scope by the time-diff
   * @param req
   * @param res
   */
  getHistories: function (req, res) {
    var sn = req.param('sn'),
      deviceType = req.param('device_type'),
      date = req.param('date'),
      scope = req.param('scope');


    var startDate = new Date(date.split(',')[0].split('[')[1]),
      endDate = new Date(date.split(',')[1].split(']')[0]);

    var timeDiff = parseInt(Math.abs(endDate - startDate) / 1000);
    var scopeCondition = {};

    //if large time scope
    if (timeDiff > 7 * 3600 * 24) {       //7 days
      scopeCondition = {scope: 'scope2'}                // 'receiver/config/env.js'
      scope = 'scope2';
    } else if (timeDiff > 3600 * 24) {      // 1~7 days
      if (scope === 'scope0')
        scope = 'scope1';
      scopeCondition = {scope: scope};
    } else {                                // 1 day
      scopeCondition = {scope: scope};
    }

    if (scope === 'scope0')
      scopeCondition = {};

    var dateCondition = {update_date: {'>=': startDate, '<=': endDate}};
    var modelName = getDBModelName(deviceType, scope);
    var result = {};
    if (modelName === '') {
      result.result = 'Failed';
      result.msg = "need 'device_type'";
      return res.json(200, result);
    }

    sails.models[modelName].find()
      .where({sn: sn})
      .where(scopeCondition)
      .where(dateCondition)
      .then(function (records) {
        result.result = 'OK';
        result.msg = {
          sn: sn,
          date: date,
          scope: scope,
          device_type: deviceType,
          data: {}
        };

        getDataArrayValue(deviceType, records).then(function (dataValue) {
          result.msg.data = dataValue;
          return res.json(200, result);
        });
      });


    /*UserUtilService.currentUser(req)
     .then(function (username) {
     if (null === username) {
     res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
     } else {
     var sn = req.param('sn'),
     deviceType = req.param('device_type'),
     date = req.param('date'),
     scope = req.param('scope');

     var startDate = new Date(date.split(',')[0].split('[')[1]),
     endDate = new Date(date.split(',')[1].split(']')[0]);
     var timeDiff = parseInt(Math.abs(endDate - startDate) / 1000);
     var scopeCondition = {};

     //if large time scope
     if (timeDiff > 7 * 3600 * 24) {       //7 days
     scopeCondition = {scope: 'scope2'}                // 'receiver/config/env.js'
     scope = 'scope2';
     } else if (timeDiff > 3600 * 24) {      // 1~7 days
     scopeCondition = {scope: 'scope1'};
     scope = 'scope1';
     } else {                                // 1 day
     scopeCondition = {};
     scope = 'scope0';
     }
     var dateCondition = {update_date: {'>=': startDate, '<=': endDate}};
     var modelName = getDBModelName(deviceType, scope);
     var result = {};
     if (modelName === '') {
     result.result = 'Failed';
     result.msg = "need 'device_type'";
     return res.json(200, result);
     }

     sails.models[modelName].find()
     .where({sn: sn})
     .where(scopeCondition)
     .where(dateCondition)
     .then(function (records) {
     console.log(records);
     })
     }
     });*/
  },

};

/**
 * get the model name by the deviceType and scope
 * @param deviceType
 * @param scope
 * @return {string}
 */
function getDBModelName(deviceType, scope) {
  var modelName = '';
  var isDelicate = (scope === 'scope0' ? true : false);

  switch (deviceType) {
    case sails.config.device_type_config.device_type.smartgate:
      if (isDelicate)
        modelName = 'smartgatedata';
      else
        modelName = 'smartgateaveragedata';
      break;
    case sails.config.device_type_config.device_type.humidity_temperature:
      if (isDelicate)
        modelName = 'airthdata';
      else
        modelName = 'airthaveragedata';
      break;
    case sails.config.device_type_config.device_type.soil_th:
      if (isDelicate)
        modelName = 'soilthdata';
      else
        modelName = 'soilthaveragedata';
      break;
    case sails.config.device_type_config.device_type.co:
      if (isDelicate)
        modelName = 'codata';
      else
        modelName = 'coaveragedata';
      break;
    case sails.config.device_type_config.device_type.co2:
      if (isDelicate)
        modelName = 'co2data';
      else
        modelName = 'co2averagedata';
      break;
    case sails.config.device_type_config.device_type.illumination:
      if (isDelicate)
        modelName = 'luxdata';
      else
        modelName = 'luxaveragedata';
      break;
    default:
      modelName = '';
      break;
  }

  return modelName;
}

/**
 * get the history-value by the different deviceType
 * @param deviceType
 * @param records
 * @return {bluebird|exports|module.exports}
 */
function getDataArrayValue(deviceType, records) {
  var values = {};
  return new Promise(function (resolve, reject) {
    switch (deviceType) {
      case sails.config.device_type_config.device_type.smartgate:
        values.air_temperature = [];
        values.air_humidity = [];
        values.soil_temperature = [];
        values.soil_humidity = [];
        values.co_ppm = [];
        values.co2_ppm = [];
        values.lux = [];
        Promise.map(records, function (record) {
          values.air_temperature.push({
            value: record.air_temperature,
            time: record.update_date
          });
          values.air_humidity.push({
            value: record.air_humidity,
            time: record.update_date
          });
          values.soil_temperature.push({
            value: record.soil_temperature,
            time: record.update_date
          });
          values.soil_humidity.push({
            value: record.soil_humidity,
            time: record.update_date
          });
          values.co_ppm.push({
            value: record.co_ppm,
            time: record.update_date
          });
          values.co2_ppm.push({
            value: record.co2_ppm,
            time: record.update_date
          });
          values.lux.push({
            value: record.lux,
            time: record.update_date
          });
        }).then(function () {
          resolve(values);
        });
        break;
      case sails.config.device_type_config.device_type.humidity_temperature:
        values.air_temperature = [];
        values.air_humidity = [];
        Promise.map(records, function (record) {
          values.air_temperature.push({
            value: record.temperature,
            time: record.update_date
          });
          values.air_humidity.push({
            value: record.humidity,
            time: record.update_date
          });
        }).then(function () {
          resolve(values);
        });
        break;
      case sails.config.device_type_config.device_type.soil_th:
        values.soil_temperature = [];
        values.soil_humidity = [];
        Promise.map(records, function (record) {
          values.soil_temperature.push({
            value: record.temperature,
            time: record.update_date
          });
          values.soil_humidity.push({
            value: record.humidity,
            time: record.update_date
          });
        }).then(function () {
          resolve(values);
        });
        break;
      case sails.config.device_type_config.device_type.co:
        values.co_ppm = [];
        Promise.map(records, function (record) {
          values.co_ppm.push({
            value: record.co_ppm,
            time: record.update_date
          });
        }).then(function () {
          resolve(values);
        });
        break;
      case sails.config.device_type_config.device_type.co2:
        values.co2_ppm = [];
        Promise.map(records, function (record) {
          values.co2_ppm.push({
            value: record.co2_ppm,
            time: record.update_date
          });
        }).then(function () {
          resolve(values);
        });
        break;
      case sails.config.device_type_config.device_type.illumination:
        values.lux = [];
        Promise.map(records, function (record) {
          values.lux.push({
            value: record.lux,
            time: record.update_date
          });
        }).then(function () {
          resolve(values);
        });
        break;
      default:
        resolve(values)
        break;
    }
  })
}