/**
* DevCurData.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var getRequestDevList = function(req, records, isgrouped) {
  var result = [];
  _(records).forEach(function(devinfo) {

    var getOneResult = function() {
      var oneResult = {};

      //console.log('-->'+JSON.stringify(devinfo, null, 2));

      if (!_.isEmpty(devinfo.content)) {
        devinfo.content.body.common.online = devinfo.online;
        devinfo.content.body.common.location = devinfo.location;

        devinfo.content.body.common.groups = devinfo.devgroups;
      }
      //console.log('-->'+JSON.stringify(devinfo.content.body.common, null, 2));

      oneResult.dev_uuid = devinfo.dev_uuid;
      oneResult.dev_alias = devinfo.dev_alias;
      oneResult.component_alias = devinfo.component_alias;

      if (!_.isEmpty(devinfo.content)) {
        oneResult.common = ParamService.fillCommonParam(req, devinfo.content.body);
        if (isgrouped) 
          oneResult.common.groups = devinfo.devgroups;
        else
          oneResult.common.groups = [];
        oneResult.components = ParamService.fillComponentsParam(req, devinfo.content.body, false);


        //form alarmlist
        var componentsTemp = ParamService.fillComponentsParam(req, devinfo.content.body, true);
        var alarmList = [];
        for (var i = 0; i < componentsTemp.length; i++) {
          var keys = _.keys(componentsTemp[i]);

          for (var j in keys) {
            if (_.has(componentsTemp[i][keys[j]], 'alarm')) {
              if (componentsTemp[i][keys[j]]['alarm'].alarm_level > 0) { 
                alarmList.push(componentsTemp[i].component_id);
                break;
              }
            }
          };
        }
        oneResult.common.alarm_list = alarmList;

      } else {

        oneResult.common = {};
        if (isgrouped) 
          oneResult.common.groups = devinfo.devgroups;
        else
          oneResult.common.groups = [];
        oneResult.components = [];
      }

      return oneResult;
    }

    try {
      if (isgrouped) {
        if (devinfo.devgroups.length > 0) {
          //if (!_.isEmpty(devinfo.content))
            result.push(getOneResult());
        }
      } else {
        if (devinfo.devgroups.length == 0) {
          //if (!_.isEmpty(devinfo.content))
            result.push(getOneResult());
        }
      }
    } catch(e) {
      ;
    }

    //result.push(oneResult);
  });

  //console.log('->'+JSON.stringify(result, null, 2));
  return result;
}

module.exports = {

  attributes: {

    dev_uuid: {
      type: 'string',
      required: true,
      unique: true
    },

    dev_type: {
      type: 'string',
      required: true,
    },

    dev_alias: {
      type: 'string'
    },

    component_alias: {
      type: 'json',
    },

    component_schedule: {
      type: 'json',
    },

    content: {
      type: 'json',
      required: true,
    },

    location: {
      model: 'location'
    },

    devgroups: {
      collection: 'devgroup',
      via: "devcurdatas",
      //through: 'joingroupcache',
    },

    isgrouped: {
      type: 'boolean',
      //required: true,
      //default: false
    },

    devgeogroups: {
      collection: 'devgeogroup',
      via: "devcurdatas",
    },

    isgeogrouped: {
      type: 'boolean',
      //required: true,
      //default: false
    },

    users: {
      collection: 'user',
      via: "devcurdatas",
    },


    toJSON: function() {
      var obj = this.toObject();

      delete obj.updatedAt;
      delete obj.createdAt;
      delete obj.id;

      return obj;
    }

  },

  getList: function(dev_uuid_list) {
    return DevCurData.find({dev_uuid: dev_uuid_list})
      .then(function (models) {
        return [models];
      });
  },

  getCurInfo: function(req) {
    return DevCurData.findOne().where({dev_uuid: req.param('dev_uuid')})
    .then(function (devinfo) {
      return devinfo;
    });
  },


  getDevInfo: function(req) {
    return DevCurData.findOne().where({dev_uuid: req.param('dev_uuid')})
    .populate('location')
    .populate('devgroups')
    .populate('devgeogroups')
    .then(function (devinfo) {
      //sails.log.info('========>' + JSON.stringify(devinfo, null, 2).toString());
      var result = {};

      devinfo.content.body.common.online = devinfo.online;
      devinfo.content.body.common.location = devinfo.location;

      result.dev_uuid = req.param('dev_uuid');
      result.dev_alias = devinfo.dev_alias;
      result.component_alias = devinfo.component_alias;
      result.online    = devinfo.online;
      result.isgeogrouped = devinfo.isgeogrouped;
      result.common = ParamService.fillCommonParam(req, devinfo.content.body);
      result.common.groups = devinfo.devgroups;
      result.common.geogroups = devinfo.devgeogroups;
      result.components = ParamService.fillComponentsParam(req, devinfo.content.body);
      //sails.log.info('========>' + JSON.stringify(result, null, 2).toString());
 
      return result;
    });
  },

  getDevInfoByIDList: function(req, ids, isgrouped) {
    return DevCurData.find({ id: ids })
    .populate('location')
    .populate('devgroups')
    .then(function (records) {
      return getRequestDevList(req, records, isgrouped);
    })
  },

  getDevInfoList: function(req) {
    var limit = ParamService.getPageLimit(req); 
    var page  = ParamService.getPageNum(req); 
    var isgrouped = ParamService.getIsGrouped(req);
/*
    var getGroupedDev = function() {
      if (isgrouped == true) 
        //return DevCurData.find().where({isgrouped: true});
        return DevCurData.find().populate('location').populate('devgroups', ;
      else
        //return DevCurData.find();
        return DevCurData.find().where({isgrouped: {'!': true}});
    }
    */
    return DevCurData.find()
    .where({dev_type: 'smartgate'})
    //return getGroupedDev()
    .paginate({page: page, limit: limit})
    .populate('location')
    .populate('devgroups')
    .populate('devgeogroups')
    .then(function (records) {
      //console.log('---->'+JSON.stringify(records, null, 2));
      return getRequestDevList(req, records, isgrouped);
    })

  },

  countRecordsByGroupId: function(groupId) {
    //DevCurData.count({groups: groupId}).exec(function(err, num) {
    //DevCurData.count().where({devgroups: Devgroup.findOne(groupId)}).exec(function(err, num) {
    //DevCurData.count().where({devgroups: groupId}).exec(function(err, num) {
    DevCurData.count({devgroups: groupId}).exec(function(err, num) {
    //DevCurData.count({online: true}).exec(function(err, num) {
      console.log('===========================>num'+num);
      return num;
    });
  },

};

