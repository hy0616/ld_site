/**
 * Created by shuyi on 15-9-21.
 */
var Promise = require('bluebird');
var datetime = require('./datetime');
var http = require('http');

module.exports = {
  setEventRead: function (username, eventIdStr) {
    return new Promise(function (resolve, reject) {
      var req_data = {};
      req_data.meta = {
        type: 'delete_unread_event',
        time: datetime.getLocalString(),
        version: ''
      };
      req_data.data = {
        username: username,
        event_id_str: eventIdStr
      }

      //result is 'OK' or 'Failed'
      HttpClient.createHttpClient(req_data).then(function (values) {
        resolve(values);
      });
    })
  },

  /**
   * 将事件中抽象的信息转换为可读的文字描述
   * @param events
   * @return {bluebird|exports|module.exports}
   */
  parseEvents: function (events) {
    return new Promise(function (resolve, reject) {
      var newEvents = [];
      if (_.keys(events).length === 0)
        resolve([]);
      else{
        Promise.map(events, function (event) {
          return new Promise(function (resolve, reject) {
            var newEvent = {};
            newEvent = _.assign(newEvent, event);
            _.forEach(_.keys(event), function (keyName) {
              var newDescription = getAttributeDescription(event[keyName]);
              if (newDescription !== '')
                newEvent[keyName] = newDescription;
            });
            newEvents.push(newEvent);
            resolve();
          })
        }).then(function () {
          resolve(newEvents);
        });
      }
    })
  },
}

/**
 * 将事件中抽象的信息转换为可读的文字描述
 * @param attributeName
 * @return {string}
 */
function getAttributeDescription(attributeName) {
  var msg = '';
  switch (attributeName) {
    case sails.config.event_description_config.event_name_config.SMARTGATE_ONLINE:
      msg = '网关上线';
      break;
    case sails.config.event_description_config.event_name_config.SMARTGATE_OFFLINE:
      msg = '网关下线';
      break;
    case sails.config.event_description_config.event_name_config.DEVICE_ONLINE:
      msg = '设备上线';
      break;
    case sails.config.event_description_config.event_name_config.DEVICE_OFFLINE:
      msg = '设备下线';
      break;
    case sails.config.event_description_config.event_name_config.CHARGE_ALARM:
      msg = '低电量报警';
      break;
    case sails.config.event_description_config.event_name_config.AIR_TEMPERATURE_ALARM:
      msg = '空气温度异常报警';
      break;
    case sails.config.event_description_config.event_name_config.AIR_HUMIDITY_ALARM:
      msg = '空气湿度异常报警';
      break;
    case sails.config.event_description_config.event_name_config.SOIL_TEMPERATURE_ALARM:
      msg = '土壤温度异常报警';
      break;
    case sails.config.event_description_config.event_name_config.SOIL_HUMIDITY_ALARM:
      msg = '土壤湿度异常报警';
      break;
    case sails.config.event_description_config.event_name_config.CO_PPM_ALARM:
      msg = '一氧化碳(CO)浓度异常报警';
      break;
    case sails.config.event_description_config.event_name_config.CO2_PPM_ALARM:
      msg = '二氧化碳(CO2)浓度异常报警';
      break;
    case sails.config.event_description_config.event_name_config.LUX_ALARM:
      msg = '光照强度异常报警';
      break;
    case sails.config.event_description_config.event_type_config.NOTICE:
      msg = '通知';
      break;
    case sails.config.event_description_config.event_type_config.ALARM:
      msg = '报警';
      break;
    case sails.config.event_description_config.event_level_config.NOTICE.NOTICE_LEVEL_1:
      msg = '一级通知';
      break;
    case sails.config.event_description_config.event_level_config.NOTICE.NOTICE_LEVEL_2:
      msg = '二级通知(重要)';
      break;
    case sails.config.event_description_config.event_level_config.ALARM.ALARM_LEVEL_1:
      msg = '一级报警';
      break;
    case sails.config.event_description_config.event_level_config.ALARM.ALARM_LEVEL_2:
      msg = '二级报警(较重要)';
      break;
    case sails.config.event_description_config.event_level_config.ALARM.ALARM_LEVEL_3:
      msg = '三级报警(非常重要)';
      break;
  }
  return msg;
}