/**
 * DevCurDataController
 *
 * @description :: Server-side logic for managing devcurdatas
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var _ = require('lodash');
var Promise = require('bluebird');


function getAddressByXY(lat, lng) {
  return new Promise(function(resolve, reject) {
    BaiduMapService.getAddressByCoor(lat, lng).then(function(data){
      resolve(data);
    }).catch(function(error){
      reject(error);
    });
  });
}

module.exports = {
  getTotal: function(req, res) {
    DevCurData.count().exec(function(err, num) {
      DevCurData.count({online: true}).exec(function(err, onlineNum) {
        DevCurData.count({isgeogrouped: true}).exec(function(err, geogroupNum) {
          res.json(200, {total: num, online: onlineNum, total_geogrouped: geogroupNum});
        });
      });
    });

  },

  create: function(req, res) {
    var dev_uuid = req.param('dev_uuid');
    var dev_name = req.param('dev_name');

    if (dev_uuid === undefined) res.json(401, {err: 'need dev_uuid'});
    if (dev_name === undefined) dev_name = dev_uuid;

    var data = {};
    
    data.dev_type = 'smartgate';
    data.dev_uuid = dev_uuid;
    data.dev_alias = data.dev_uuid;
    data.online = false;
    data.content = {};
    data.isgrouped = false;
    data.isgeogrouped = false;
    //console.log('data:', JSON.stringify(data));
    DevCurData.findOrCreate({dev_uuid: data.dev_uuid}, data)
    .then(function(record) {
      //console.log('record', JSON.stringify(record));
      res.json(200, record);
    });
  },

  getDevInfo: function(req, res) {
    DevCurData.getDevInfo(req)
    .then(function(result) {
      res.json(result);
    })
    .fail(function(err) {
      res.json(err);
    });
  },

  getDevInfoList: function(req, res) {
    DevCurData.getDevInfoList(req)
    .then(function(result) {
      res.json(result);
    })
    .fail(function(err) {
      res.json(err);
    });
  },

  updateDevAlias: function(req, res) {
    var dev_uuid = req.param('dev_uuid');
    var alias = req.param('alias');

    if (dev_uuid === undefined) res.json(401, {err: 'need dev_uuid'});
    if (alias === undefined) res.json(401, {err: 'need alias'});

    DevCurData.update({dev_uuid: dev_uuid}, {dev_alias: alias})
    .then(function(record) {
      if (record.length > 0) {
        res.json(200, record[0]);
      } else {
        res.json(401, {err: 'update alias fail'});
      }
    });
  },


  updateAlarmRule: function(req, res) {
    var dev_uuid = req.param('dev_uuid');
    var component_id = req.param('component_id'); 
    var para_key = req.param('para_key');
    var alarm_rule = ParamService.getAlarmRule(req);

    if (_.isEmpty(alarm_rule)) res.json(401, {err: 'alarm rule is not right'});
    if (dev_uuid === undefined) res.json(401, {err: 'need dev_uuid'});
    if (alarm_rule === undefined) res.json(401, {err: 'need rule'});

    DevCurData.findOne({dev_uuid: dev_uuid})
    .then(function(record) {
      //console.log('components=', JSON.stringify(record.content.body.components, null, 2));
      //console.log('id', component_id);
      var index = _.findIndex(record.content.body.components, {component_id: parseInt(component_id)});
      //console.log('index=', index);
      if (index >= 0) {
        if (!_.has(record, 'alarm_rule'))
          record.alarm_rule = {};
        if (!_.has(record.alarm_rule, component_id))
          record.alarm_rule[component_id] = {};
        record.alarm_rule[component_id][para_key] = alarm_rule;

        delete record.isgeogrouped;
        delete record.devgeogroups;
        delete record.devgroups;
        delete record.isgrouped;
        delete record.users;

        DevCurData.update({dev_uuid: dev_uuid}, record)
        .then(function(record) {
          res.json(200, record[0]);
        });
      } else {
        res.json(401, {err: 'can not find this component_id'});
      }
    });

  },


  updateDevComponetAlias: function(req, res) {
    var dev_uuid = req.param('dev_uuid');
    var component_id = req.param('component_id'); 
    var alias = req.param('alias');

    if (dev_uuid === undefined) res.json(401, {err: 'need dev_uuid'});
    if (component_id === undefined) res.json(401, {err: 'need component_id'});
    if (alias === undefined) res.json(401, {err: 'need alias'});

    DevCurData.findOne({dev_uuid: dev_uuid})
    .then(function(record) {
      //console.log('components=', JSON.stringify(record.content.body.components, null, 2));
      //console.log('id', component_id);
      var index = _.findIndex(record.content.body.components, {component_id: parseInt(component_id)});
      //console.log('index=', index);
      if (index >= 0) {
        //record.content.body.components[index].alias = alias;
        if (!_.has(record, 'component_alias'))
          record.component_alias = {};
        record.component_alias[component_id] = alias;

        delete record.isgeogrouped;
        delete record.devgeogroups;
        delete record.devgroups;
        delete record.isgrouped;
        delete record.users;

        DevCurData.update({dev_uuid: dev_uuid}, record)
        .then(function(record) {
          res.json(200, record[0]);
        });
      } else {
        res.json(401, {err: 'can not find this component_id'});
      }
    });
  },


  updateLocation: function(req, res) {
    var lat = req.param('lat');
    var lng = req.param('lng');
    var dev_alias = req.param('dev_alias');
    var groups = req.param('groups');

    var dev_uuid = req.param('dev_uuid');

    DevCurData.findOne({dev_uuid: dev_uuid})
    .populate('location')
    .populate('devgeogroups')
    .then(function(device) {
      //console.log('------------->device', JSON.stringify(device, null, 2));
      return [device, getAddressByXY(lat, lng)];
    })
    .spread(function(device, address) {
      var result = address.result;
      //console.log('---->address', JSON.stringify(address, null, 2));

      device.location.address  = result.formatted_address;

      device.location.country  = result.addressComponent.country;
      device.location.province = result.addressComponent.province;
      device.location.city     = result.addressComponent.city;
      device.location.city_code= result.cityCode;
      device.location.district = result.addressComponent.district;
      device.location.street   = result.addressComponent.street;
      device.location.lat      = lat;
      device.location.lng      = lng;
      device.location.street_number = result.addressComponent.street_number;

      device.location.save();

      return device;
    })
    .then(function(device) {
      if (_.isEmpty(device.location.province) || _.isEmpty(device.location.city)) {
        return Promise.props({
          addDeviceToGroups:   addDeviceToGroups(dev_uuid, groups, device),
        }).then(function(result) {
          return device;
        })
        .fail(function(err) {
          return device;
        });
      } else {
        return Promise.props({
          updateProvinceGroup: updateDeviceGeoGroup(device, device.location.province, 'province'),
          updateCityGroup:     updateDeviceGeoGroup(device, device.location.city, 'city'),
          addDeviceToGroups:   addDeviceToGroups(dev_uuid, groups, device),
        }).then(function(result) {
          return device;
        })
        .fail(function(err) {
          return device;
        });
      }

/*
      return Promise.props({
        updateProvinceGroup: updateDeviceGeoGroup(device, device.location.province, 'province'),
        updateCityGroup:     updateDeviceGeoGroup(device, device.location.city, 'city'),
        addDeviceToGroups:   addDeviceToGroups(dev_uuid, groups, device),
      }).then(function(result) {
        return device;
      });
*/
    })
    .then(function(device) {
      return DevCurData.update({dev_uuid: dev_uuid}, {dev_alias: dev_alias})
      .then(function(record) {
        return record[0];
      })
    })
    .then(function(result) {
      res.json(200, result);
    });

  },


  updateSchedule: function(req, res) {
    var dev_uuid = req.param('dev_uuid');
    var component_id = req.param('component_id');
    var schedule = req.param('schedule');

    if (dev_uuid === undefined) res.json(401, {err: 'need dev_uuid'});
    if (component_id === undefined) res.json(401, {err: 'need component_id'});

    DevCurData.findOne({dev_uuid: dev_uuid})
    .then(function(record) {

      if (record != undefined) {
        var index = _.findIndex(record.content.body.components, {component_id: parseInt(component_id)});
        if (index >= 0) {
          //console.log('index=', index);
          //console.log('schedule=', schedule);
          //record.content.body.components[index].schedule = String(schedule);
          record.component_schedule = {};
          record.component_schedule[component_id] = String(schedule);

          //console.log('---------------->', JSON.stringify(record,null,2));
          record.save(function(err) {
            if (err) 
              res.json(401, {err: 'update schedule fail'});
            else
              res.json(200, {message: 'update schedule ok'});
          });
        } else {
          res.json(401, {err: 'not this component_id'});
        }
      } else {
        res.json(401, {err: 'can not find this record, check your dev_uuid'});
      }
    });
  },

  getSchedule: function(req, res) {
    var dev_uuid = req.param('dev_uuid');
    var component_id = req.param('component_id');

    if (dev_uuid === undefined) res.json(401, {err: 'need dev_uuid'});
    if (component_id === undefined) res.json(401, {err: 'need component_id'});

    DevCurData.findOne({dev_uuid: dev_uuid})
    .then(function(record) {
      if (record != undefined) {
        var index = _.findIndex(record.content.body.components, {component_id: parseInt(component_id)});
        if (index >= 0) {
          //var component = record.content.body.components[index];
          //var component = record.component_schedule[component_id];
          if (_.has(record.component_schedule, component_id)) 
            //res.json(200, component.schedule);
            res.json(200, record.component_schedule[component_id]);
          else 
            res.json(401, {err: 'no schedule'});
        } else {
          res.json(401, {err: 'not this component_id'});
        }
      } else {
        res.json(401, {err: 'can not find this record, check your dev_uuid'});
      }
    });

  },

};


function changeDeviceGeoGroup(device, curGroupID, tarGroup) {

  DevGeoGroup.findOne(curGroupID)
  .then(function(group) {
    group.devcurdatas.remove(device.id);
    group.save();
  })

  tarGroup.devcurdatas.add(device.id);
  tarGroup.save();

}

function findOrCreateDevGeoGroup(device, groupName, scope) {
  //return DevGeoGroup.findOne({name: groupName, scope: scope})
  return DevGeoGroup.findOne({alias: groupName.substring(0,2), scope: scope})
  .then(function(group) {
    if (group === undefined) {
      var newGroup = {};
      newGroup.name = groupName;
      newGroup.scope = scope;
      if (scope == 'province') {
        newGroup.parent_name = '中国';
      } else {
        newGroup.parent_name = device.location.province;
      }

      return DevGeoGroup.create(newGroup)
        .then(function(group) {
          //console.log('----------------->create, group', group.devcurdatas);
          return group;
        })
    } else {
      return group;
    }
  })
  .then(function(group) {
    return group;
  });
}


function updateDeviceGeoGroup(device, groupName, scope) {
  return findOrCreateDevGeoGroup(device, groupName, scope)
  .then(function(group) {
    var id = undefined;
    device.devgeogroups.forEach(function(group) {
      if (group.scope == scope) id = group.id;
    });

    //if same group, no need migrate to new group
    if (id === undefined || id != group.id) {
      changeDeviceGeoGroup(device, id, group);
    }

    return device;
  })
}


function addDeviceToOneGroup(groupName, device) {
  return new Promise(function(resolve, reject) {
    Devgroup.findOneByName(groupName).then(function(group) {
      if (group != undefined) {
        group.devcurdatas.add({id: device.id});
        group.save(function(err) {
          if (err == null) {
            resolve(group);
          } else {
            reject(err);
          }
        });
      }
    })
  });
}

function addDeviceToGroups(dev_uuid, groups, device) {
  return new Promise(function(resolve, reject) {
    if (groups == undefined) resolve([]);
    if (_.isArray(groups) && groups.length > 0) {
      DevCurData.findOne()
      .where({dev_uuid: dev_uuid})
      .then(function(device) {
        var addDevice = [];
        groups.forEach(function(group) {
          addDevice.push(addDeviceToOneGroup(group, device));
        });

        Promise.all(addDevice)
        .then(function() {
          resolve(groups);
        });
      })
      .catch(function(e) {
        sails.log.error('add device error: '+e.stack);
        reject(e);
      });
    } else {
      resolve([]);
    }
  });
}





