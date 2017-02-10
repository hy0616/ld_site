
var _ = require('lodash');
var moment = require('moment');
//var Promise = require('bluebird');


function covertToAlarmArray(records, componentID, alarmType) {
  alarmType = (alarmType === undefined) ? 'online' : alarmType;
  var result = [];
  records.forEach(function(record) {
    if (alarmType != 'online') {
      var alarmType1 = alarmType;
      if (alarmType1 == 'component_online')
        alarmType1 = 'online';

      record.content.components.forEach(function(component) {
        if (component.component_id = componentID) {
          if (_.has(component, alarmType1)) {
            //console.log('-------component', JSON.stringify(component));
            if (component[alarmType1].alarm_level > 0) {
              var data = {};
              data.date = record.alarm_date;
              data.alarm_val = component[alarmType1].alarm_value;
              data.alarm_level = component[alarmType1].alarm_level;
              data.alarm_bind = component[alarmType1].bind;
            
              //console.log("------------>data", data);
              result.push(data);
            }
          }
        }
      });
    } else {
      var data = {};
      data.date = record.alarm_date;
      if (record.content.online)
        data.alarm_val = 'online';
      else
        data.alarm_val = 'offline';
      result.push(data);
    }
  });

  return result;
}

function covertToAlarmList(records) {
  var result = [];
  var region = 'zh';

  records.forEach(function(record) {
      //console.log('---------------', record.alarm_name);
    if (record.alarm_name == 'online') {
      var data = {};
      //data.date = record.alarm_date;
      //data.date = record.dev_date;
      data.date = moment(record.dev_date.getTime()).format('YYYY-MM-DD HH:mm:ss');
      data.dev_type = record.dev_uuid.split('-')[0];
      data.dev_uuid = record.dev_uuid;
      data.alarm_type = lang.getLangString(region, 'online_offline');
      if (record.content.online)
        data.alarm_val  = lang.getLangString(region, 'online');
      else
        data.alarm_val  = lang.getLangString(region, 'offline');

      result.push(data);
    } else if (record.alarm_name == 'para') {
      var data = {};

      var getAlarmVal = function(type, component) {
        if (_.has(component, type)) {
          if (component[type].alarm_level > 0) {
            var data = {};
            //data.date = record.alarm_date;
            data.date = record.dev_date;
            data.dev_type = record.dev_uuid.split('-')[0];
            data.dev_uuid = record.dev_uuid;
            data.alarm_type = type.toUpperCase();

            if (data.alarm_type == 'ONLINE') {
              data.alarm_val = lang.getLangString(region, 'chn') +
                component.component_id + 
                ': ' + type.toUpperCase() + lang.getLangString(region, 'alarm') + ', offline';
            } else {
              data.alarm_val = lang.getLangString(region, 'chn') +
                component.component_id + 
                ': ' + type.toUpperCase() + lang.getLangString(region, 'alarm') +
                ',' + lang.getLangString(region, 'alarm_level') + 
                lang.getLangString(region, 'is') + 
                component[type].alarm_level;
            }
            return data;
          } else {
            return null;
          }
        } else {
          return null;
        }
      }

      record.content.components.forEach(function(component) {

        var data = getAlarmVal('online', component);
        if (data) result.push(data);
        var data = getAlarmVal('humidity', component);
        if (data) result.push(data);

      });

    }
  });

  return result;
}


module.exports = {
  getList: function(req, res) {
    var devType = req.param('dev_type');
    var devUUID = req.param('dev_uuid');
    var alarmName = req.param('alarm_name');

    var startDate = req.param('start_date');
    var endDate = req.param('end_date');

    var limit = ParamService.getPageLimit(req); 
    var page  = ParamService.getPageNum(req); 
 
    var condition = {};

    if (devType != undefined) condition.dev_type = devType;
    if (devUUID != undefined) condition.dev_uuid = devUUID;
    if (alarmName != undefined) condition.alarm_name = alarmName;
    if (startDate != undefined && endDate != undefined) {
      //condition.alarm_date = { '>=': new Date(startDate), '<=': new Date(endDate)};
      condition.dev_date = { '>=': new Date(startDate), '<=': new Date(endDate)};
    } else {
      //condition.alarm_date = { '>=': new Date(datetime.getLocalDateString()) };
      condition.dev_date = { '>=': new Date(datetime.getLocalDateString()) };
    }

    DevAlarm.find(condition)
    .paginate({page: page, limit: limit})
    .sort({dev_date: 'desc'})
    .then(function(records) {
      //console.log(JSON.stringify(records, null, 2));
      //return res.json(records);

      var result = covertToAlarmList(records);
      return res.json(result);
    });

  },


  getAlarmDataArray: function(req, res) {
    var devType = req.param('dev_type');
    var devUUID = req.param('dev_uuid');
    var componentID = req.param('component_id');
    var alarmType = req.param('alarm_type');

    var startDate = req.param('start_date');
    var endDate = req.param('end_date');

    var limit = ParamService.getPageLimit(req); 
    var page  = ParamService.getPageNum(req); 
 
    var condition = {};

    if (devType === undefined) res.json(401, {err: 'need dev_type'});
    if (devUUID === undefined) res.json(401, {err: 'need dev_uuid'});
    //if (alarmType === undefined) res.json(401, {err: 'need alarm_type'});
    if (componentID === undefined) res.json(401, {err: 'need component_id'});

    //condition.dev_type = devType;
    condition.dev_uuid = devUUID;
    //if (alarmType == 'snr' || alarmType == 'rssi')
    if (alarmType == 'humidity' || alarmType == 'temperature')
      condition.alarm_name = 'para';
    else if (alarmType == 'component_online')
      condition.alarm_name = 'component_online';
    else 
      condition.alarm_name = 'online';

    if (startDate != undefined && endDate != undefined) {
      condition.alarm_date = { '>=': new Date(startDate), '<=': new Date(endDate)};
    } else {
      condition.alarm_date = { '>=': new Date(datetime.getLocalDateString()) };
    }

    //console.log('--------->condition=', condition, 'alarm_type=', alarmType);
    DevAlarm.find(condition)
    .paginate({page: page, limit: limit})
    .then(function(records) {
      //console.log(JSON.stringify(records, null, 2));
      //return res.json(records);

      var result = covertToAlarmArray(records, componentID, alarmType);
      return res.json(result);
    });

  },




};
