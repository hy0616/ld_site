var _ = require('lodash');

module.exports = {
  getPageLimit: function(req) {
    //return (req.param('limit') === undefined ? 20 : req.param('limit'));
    return (req.param('limit') === undefined ? 50 : req.param('limit'));
  },

  getPageNum: function(req) {
    return (req.param('page') === undefined ? 1 : req.param('page'));
  },

  getIsGrouped: function(req) {
    if (req.param('isgrouped') === undefined)
      return false;
    else {
      if (req.param('isgrouped') == 'true')
        return true;
      else
        return false;
    }
  },

  getAlarmRule: function(req) {
    var alarmRule = {};

    if (req.param('min') != undefined) {
      var min_val = req.param('min').trim().split(',');

      if (min_val.length > 0) {
        alarmRule.custom_min = [];

        _.forEach(min_val,function(val) {
          alarmRule.custom_min.push(parseInt(val));
        });
      }
    } 

    if (req.param('max') != undefined) {
      var max_val = req.param('max').trim().split(',');

      if (max_val.length > 0) {
        alarmRule.custom_max = [];

        _.forEach(max_val, function(val) {
          alarmRule.custom_max.push(parseInt(val));
        });
      }

    } 

    return alarmRule;
  },


  fillCommonParam: function(req, record) {
    var result = {};
    if (req.param('common') != undefined) {
      if (req.param('common') != 'null') {
        var commonKeys = req.param('common').trim().split(',');
        result = {};
        _.forEach(commonKeys, function(key) {
          if (_.has(record.common, key))
            result[key] = record.common[key];
        });
      }
    } else {
      result = record.common;
    }

    return result;
  },

  fillComponentsParam: function(req, record, needAll) {
    if (needAll) return record.components;

    if (req.param('components') != undefined) {
      if (req.param('components') != 'null') {
        var result = [];

        if (req.param('parse_type') === 'special') {
          var components = req.param('components').trim().split('],');
          _.forEach(components, function(keyVal) {
            var id = parseInt(keyVal.split('[')[0]);
            var val = _.find(record.components, {'component_id': id});
            var keys = keyVal.split('[')[1].split(',');

            //console.log('component_ids='+ids);
            //console.log('keys='+keys);

            if (keys.indexOf('all') >= 0 || keys.indexOf('all]') >= 0) {
              requestVal = val;
            } else {
              var requestVal = {};
              _.forEach(keys, function(key) {
                key = key.trim();
                if (key.indexOf(']') > 0)    key = key.substring(0, key.length -1);
                if (_.has(val, key)) {
                  requestVal.component_id = val.component_id;
                  requestVal[key] = val[key];
                }
              });
            }
            result.push(requestVal);
          });
        } else if (req.param('parse_type') === 'normal' || req.param('parse_type') === undefined){
          var componentsKeyVal = req.param('components').split('],[');
          var ids = componentsKeyVal[0].split('[')[1].split(',');
          var keys = componentsKeyVal[1].split(']')[0].split(',');

          //console.log('component_ids='+ids);
          //console.log('keys='+keys);

          _.forEach(ids, function(id) {
            var val = _.find(record.components, {'component_id': parseInt(id)});

            if (keys.indexOf('all') >= 0) {
              requestVal = val;
            } else {
              var requestVal = {};
              _.forEach(keys,function(key) {
                if (key.indexOf(']') >= 0)    key = key.substring(0, key.length -1);
                if (_.has(val, key)) {
                  requestVal.component_id = val.component_id;
                  requestVal[key] = val[key];
                }
              });
            }
            result.push(requestVal);
          });
        }

        return result;
      }
    } else {
      return record.components;
    }
  },

};
