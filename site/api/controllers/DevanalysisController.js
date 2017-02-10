/**
 * DevanalysisController
 *
 * @description :: Server-side logic for managing devanalyses
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var scopeSplite = {
  'min' : 60000,
  'hour': 3600*1000,
  'day' : 3600*24*1000
}

var dateDiff = function(startDate, endDate, scope) {
  return parseInt((endDate - startDate)/scopeSplite[scope]);
}

var getIndex = function(curDate, startDate, scope) {
  return parseInt((curDate - startDate)/ scopeSplite[scope]);
}

//use type and bindkeys to filter the records which satisfy the date scope
var filterRecords = function(records, dev_uuid, component_id, 
                             type, bindkeys, date, scope,
                             startDate, endDate, date_mode) {
  var result = {};
  result.dev_uuid = dev_uuid;
  result.component_id = component_id;
  result.date = date;
  result.type = type;

  if (bindkeys === undefined)
    result.bindkeys = undefined;
  else
    result.bindkeys = bindkeys.split(',');
  result.scope = scope;

  //set the result data array
  //
  var diff = dateDiff(startDate, endDate, scope);
  if (result.bindkeys === undefined) {
    result.data = new Array(diff);
    var sum   = new Array(diff);
    var count = new Array(diff);
    for (var i = 0; i < diff; i++) {
      result.data[i] = 0;
      sum[i]         = 0;
      count[i]       = 0;
    }
  } else {
    result.data = {};
    var sum = {};
    var count = {};
    _(result.bindkeys).forEach(function(key) {
      result.data[key] = new Array(diff);
      sum[key]   = new Array(diff);
      count[key] = new Array(diff);

      for (var i = 0; i < diff; i++) {
        result.data[key][i] = 0;
        sum[key][i]         = 0;
        count[key][i]       = 0;
      }
    });
  }

  //caculate the sum and the count satisfy the data
  var dateType = (date_mode === 'server') ? 'analysis_date' : 'dev_date';
  //console.log('================>'+dateType);
  //console.log('================> records num:'+records.length);
  _(records).forEach(function(record) {
      var index = getIndex(record[dateType], startDate, scope);
      //console.log('======>index='+index+'===>bindkeys='+result.bindkeys);
      //console.log('======>record=' + JSON.stringify(record, null, 2));

      for(i in record.content.components) {
        //console.log('=======>i='+i+'component_id='+component_id);
        if (record.content.components[i].component_id == parseInt(component_id)) {
          //console.log('ok=======>i='+i);
          if (result.bindkeys === undefined) {
            var val = record.content.components[i][type];
            //console.log('val=======>'+val);
            if (val != undefined && val['usage'] == 'average') {
              sum[index] += val['value'];
              count[index] += 1;
            }
          } else {
            _(result.bindkeys).forEach(function(key) {
              key = String(key);
              //console.log(JSON.stringify(record, null, 2));
              if (_.has(record.content.components[i], type)) {
                //var val = record.content.components[i][type][key];
                var val = record.content.components[i][type];
                if (val != undefined && val['usage'] == 'average') {
                  var realVal = val['value'][key];
                  if (realVal != undefined) {
                    sum[key][index] += realVal;
                    count[key][index] += 1;
                  }
                  //console.log('----------> key' + key + ',val='+val+ ',sum='+sum[key][index]+',(index)' + index);
                }
              }
            });
          }
          break;
        }
      }

  });

  //caculate the average val for data
  if (result.bindkeys === undefined) {
    for(var i = 0; i < result.data.length; i++) {
      //console.log('=======>  i='+i+',count='+count[i]+',sum='+sum[i]);
      if (count[i] == 0)
        result.data[i] = 0;
      else
        result.data[i] = parseFloat((sum[i] / count[i]).toFixed(2));
    }
  } else {
    _(result.bindkeys).forEach(function(key) {
      for(var i = 0; i < result.data[key].length; i++) {
          //console.log('=======> key='+key+', i='+i+',count='+count[key][i]+',sum='+sum[key][i]);
          if (count[key][i] == 0)
            result.data[key][i] = 0;
          else
            result.data[key][i] = parseFloat((sum[key][i] / count[key][i]).toFixed(2));
      }
    });
  }

  return result;

};

var getRecordsBindkeys = function(records, dev_uuid, type) {
  var result = {};
  result.dev_uuid = dev_uuid;
  result.type = type;

  result.components = {};
  _(records).forEach(function(record) {
    _(record.content.components).forEach(function(component) {
      //check if need type exist
      if (_.has(component, type)) {
        //check is bindkey object
        if (_.isObject(component[type]['value'])) {
          var component_id = component.component_id;
          var bindkeys     = _.keys(component[type]['value']);

          if (result.components[component_id] === undefined) {
            result.components[component_id] = {};
            _(bindkeys).forEach(function(bindkey) {
              result.components[component_id][bindkey] = 1;
            });
          } else {
            _(bindkeys).forEach(function(bindkey) {
              if (_.has(result.components[component_id], bindkey)) {
                result.components[component_id][bindkey] = parseInt(result.components[component_id][bindkey]) + 1;
              } else {
                result.components[component_id][bindkey] = 1;
              }
            });
          }

        }
      }
    });
  });

  return result;

};


module.exports = {
  getAnalysisResult: function(req, res) {
    //the query params
    var dev_uuid = req.param('dev_uuid');
    var component_id = parseInt(req.param('component_id'));
    var date = req.param('date');
    var date_mode = req.param('date_mode');
    var scope = req.param('scope');


    //the filter params
    var type = req.param('type');
    var bindkeys = req.param('bindkeys');

    var startDate = new Date(date.split(',')[0].split('[')[1]);
    var endDate   = new Date(date.split(',')[1].split(']')[0]);
    var timeDiff  = parseInt(Math.abs(endDate - startDate) / 1000);

    //if large time scope, use hour
    if (timeDiff > 10*3600*24) {
      if (scope == 'day') {
        var scopeCondition = {scope: 1800};
      } else if (scope == 'hour') {
        var scopeCondition = {scope: 600};
      } else {
        var scopeCondition = {scope: 60};
      }
    } else {
        var scopeCondition = {scope: 60};
    }

    var dateCondition  = (date_mode === 'server') ? 
                         {analysis_date: { '>=': startDate, '<=': endDate}} : 
                         {dev_date: { '>=': startDate, '<=': endDate}};

    if (type === undefined) return res.json({err: "need 'type'"});

    Devanalysis.find()
    .where({dev_uuid: dev_uuid})
    .where(dateCondition)
    .where(scopeCondition)
    .then(function(records) {
      //console.log('analysis records: ' + JSON.stringify(records, null, 2));
      var result = filterRecords(records, dev_uuid, component_id,  
                                 type, bindkeys, date, scope,
                                 startDate, endDate, date_mode);


      return res.json(result);
    });
  },

  getBindKeysListByDate: function(req, res) {
    //the query params
    var dev_uuid = req.param('dev_uuid');
    var date = req.param('date');
    var date_mode = req.param('date_mode');

    //the filter params
    var type = req.param('type');
    var scope = req.param('scope');

    var startDate = new Date(date.split(',')[0].split('[')[1]);
    var endDate   = new Date(date.split(',')[1].split(']')[0]);

    var dateCondition  = (date_mode === 'server') ? 
                         {analysis_date: { '>=': startDate, '<=': endDate}} : 
                         {dev_date: { '>=': startDate, '<=': endDate}};

    if (type === undefined) return res.json({err: "need 'type'"});

    Devanalysis.find()
    .where({dev_uuid: dev_uuid})
    .where(dateCondition)
    .then(function(records) {
      var resultTemp = getRecordsBindkeys(records, dev_uuid, type);

      var result = {};
      result.dev_uuid = resultTemp.dev_uuid;
      result.type = resultTemp.type;
      result.components = [];

      var keys = _.keys(resultTemp.components);
      _(keys).forEach(function(key) {
        var val = {};
        val.component_id = parseInt(key);
        val.bindkeys = [];

        var valKeys = _.keys(resultTemp.components[key]);
        _(valKeys).forEach(function(valKey) {
          var bindKeyVal = {};
          bindKeyVal.key = valKey;
          bindKeyVal.count = parseInt(resultTemp.components[key][valKey]);
          val.bindkeys.push(bindKeyVal);
        });

        val.bindkeys.sort(function(a, b) {
          return parseInt(a.count) < parseInt(b.count);
        });

        val.sortkey = [];
        _(val.bindkeys).forEach(function(bindkey) {

          //below tempr is for rs
/*
          var tempr = {};
          tempr['mode'] = FreqUtilService.getFreqMode(bindkey.key);
          tempr['freq'] = parseInt(bindkey.key);
          if (tempr['mode'] == 'fm')
            tempr['name'] = tempr['mode'] + ' ' + 
                            FreqUtilService.getFreqMHz(bindkey.key) + 'MHz';
          else 
            tempr['name'] = tempr['mode'] + ' ' + 
                            parseInt(bindkey.key) + 'KHz';

          val.sortkey.push(tempr);
*/
          val.sortkey.push(bindkey.key);
        });

        delete val.bindkeys;

        result.components.push(val);
      })

      return res.json(result);
    });

  },

};

