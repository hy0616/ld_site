/**
 * Created by shuyi on 15-9-10.
 */
var Promise = require('bluebird');
var datetime = require('./datetime');
var http = require('http');

module.exports = {
  /**
   * add a custom-alarm-strategy
   * @param newStrategy
   * @returns {bluebird|exports|module.exports}
   */
  addCustomAlarmStrategy: function (newStrategy) {
    return new Promise(function (resolve, reject) {
      var req_data = {};
      req_data.meta = {
        type: 'add_custom_alarm_strategy',
        time: datetime.getLocalString(),
        version: ''
      };
      req_data.data = {
        strategy: newStrategy
      }

      //result is 'OK' or 'Failed'
      HttpClient.createHttpClient(req_data).then(function (result) {
        resolve(result);
      });
    });
  },

  /**
   * update a custom-alarm-strategy
   * @param newStrategy
   * @returns {bluebird|exports|module.exports}
   */
  updateCustomAlarmStrategy: function (newStrategy) {
    return new Promise(function (resolve, reject) {
      var req_data = {};
      req_data.meta = {
        type: 'update_custom_alarm_strategy',
        time: datetime.getLocalString(),
        version: ''
      };
      req_data.data = {
        strategy: newStrategy
      }

      //result is 'OK' or 'Failed'
      HttpClient.createHttpClient(req_data).then(function (values) {
        resolve(values);
      });
    });
  },

  /**
   * delete a custom-alarm-strategy
   * @param strategyId
   * @returns {bluebird|exports|module.exports}
   */
  deleteCustomAlarmStrategy: function (strategyId) {
    return new Promise(function (resolve, reject) {
      var req_data = {};
      req_data.meta = {
        type: 'delete_custom_alarm_strategy',
        time: datetime.getLocalString(),
        version: ''
      };
      req_data.data = {
        strategy_id: strategyId
      }

      //result is 'OK' or 'Failed'
      HttpClient.createHttpClient(req_data).then(function (values) {
        resolve(values);
      });
    });
  },

  /**
   * get the special shed's alarm-strategy
   */
  getShedAlarmStrategy: function (shedId) {
    return new Promise(function (resolve, reject) {
      var req_data = {};
      req_data.meta = {
        type: 'get_shed_alarm_strategy',
        time: datetime.getLocalString(),
        version: ''
      };
      req_data.data = {
        shed_id: shedId
      }

      /**
       * result:{
       *  result:'OK/Failed'
       *  strategy:strategy
       * }
       */
      HttpClient.createHttpClient(req_data).then(function (values) {
        resolve(values);
      });
    });
  },

  /**
   * assign a alarm-strategy to a shed
   * @param metaData
   * @returns {bluebird|exports|module.exports}
   */
  assignShedAlarmStrategy: function (metaData) {
    return new Promise(function (resolve, reject) {
      var req_data = {};
      req_data.meta = {
        type: 'assign_shed_alarm_strategy',
        time: datetime.getLocalString(),
        version: ''
      };
      req_data.data = {
        shed_id: metaData.shed_id,
        strategy_type: metaData.strategy_type,
        strategy_id: metaData.strategy_id,
        username:metaData.username,
        strategy: metaData.strategy
      }

      //result is 'OK' or 'Failed'
      HttpClient.createHttpClient(req_data).then(function (values) {
        resolve(values);
      });
    });
  },

  /**
   * delete the shed's alarm-strategy
   * @param shedId
   * @returns {bluebird|exports|module.exports}
   */
  deleteShedAlarmStrategy: function (shedId) {
    return new Promise(function (resolve, reject) {
      var req_data = {};
      req_data.meta = {
        type: 'delete_shed_alarm_strategy',
        time: datetime.getLocalString(),
        version: ''
      };
      req_data.data = {
        shed_id: shedId
      }

      //result is 'OK' or 'Failed'
      HttpClient.createHttpClient(req_data).then(function (values) {
        resolve(values);
      });
    });
  }
}