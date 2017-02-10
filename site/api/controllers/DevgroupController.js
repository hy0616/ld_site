/**
 * DevGroupController
 *
 * @description :: Server-side logic for managing Devgroups
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  index: function(req, res) {
    var limit = ParamService.getPageLimit(req); 
    var page  = ParamService.getPageNum(req); 

    Devgroup.find()
    .paginate({page: page, limit: limit})
    .then(function(groups) {
      async.each(groups, function(group, cb) {
        QueryService.countModel(DevCurData, 1000, 'devgroups', {name: group.name})
        .then(function(groupCount) {
          group.count = groupCount;
          cb();
        });
      },
      function(err) {
        res.json(200, groups);
      });
    })
    .catch(function(e) {
      sails.log.error('get devgroups err:'+e.stack); 
    });

  },

  create: function(req, res) {
    var name = req.param('name');
    var color = req.param('color');

    Devgroup.findOneByName(name)
    .then(function(record) {
      if (_.isEmpty(record))
        return false;
      else 
        return true;
    })
    .then(function(isFind) {
      if (isFind) {
        return res.json(401, {err_code: -1, err_msg: 'is already create'});
      } else {
        Devgroup.create({name: name, color: color}, function(err, group) {
          return res.json(200, group);
        });
      }
    })
  }, 

  destroy: function(req, res) {
    var groupName = req.param('name');
    var groupName2 = req.body.name;

    console.log("params: ", req.param)

    console.log("destroy  groupName ===> ", groupName)
    Devgroup.findOneByName(groupName).then(function(group) {
      console.log("group.destroy==> ", group)
      group.destroy();
      res.json(200, {err_code: 0, err_msg: 'success'});
    });
  },

  addDevice: function(req, res) {
    var groupName = req.param('group_name');
    var dev_uuid = req.param('dev_uuid');

    DevCurData.findOne()
    .where({dev_uuid: dev_uuid})
    .then(function(device) {
      Devgroup.findOneByName(groupName).then(function(group) {
        group.devcurdatas.add({id: device.id});
        group.save(function(err) {
          if (err == null) {
            res.json(200, group);
          } else {
            sails.log.error('group save error:' +err);
            res.json(401, {err_code: -1, err_msg: 'group save error'});
          }
        });
      })
    })
    .catch(function(e) {
      sails.log.error('add device error: '+e.stack);
    });
  },

  rmDevice: function(req, res) {
    var groupName = req.param('group_name');
    var dev_uuid = req.param('dev_uuid');

    DevCurData.findOne()
    .where({dev_uuid: dev_uuid})
    .then(function(device) {
      Devgroup.findOneByName(groupName).then(function(group) {
        group.devcurdatas.remove(device.id);
        group.save(function(err) {
          if (err == null) {
            res.json(200, group);
          } else {
            sails.log.error('group save error:' +err);
            res.json(401, {err_code: -1, err_msg: 'group save error'});
          }
        });
      })
    })
    .catch(function(e) {
      sails.log.error('add device error: '+e.stack);
    });
  },


  addDeviceList: function(req, res) {
    var groupNames = req.param('group_name').split(',');
    var dev_uuids = req.param('dev_uuid').split(',') ;

    DevCurData.find()
    .where({dev_uuid: dev_uuids})
    .then(function(devices) {
      async.eachSeries(groupNames, function(groupName, cb) {
        async.eachSeries(devices, function(device, cb1) {
          //console.log('==========>'+groupName+',device='+device.dev_uuid);
          Devgroup.findOneByName(groupName)
          .exec(function(err, group) {
            group.devcurdatas.add({id: device.id});
            group.save();
          });
          cb1(null);
        }, function(err1) {
        });
        cb(null);
      }, function(err) {
        if (err == null) res.json(200, {err: 'ok'});
      });
    })
    .catch(function(e) {
      sails.log.error('add device error: '+e.stack);
    });
  },



  getDeviceList: function(req, res) {
    var limit = ParamService.getPageLimit(req); 
    var page  = ParamService.getPageNum(req);
/*
    if (req.param('group_name') === undefined) {
      res.json(401, {err: 'group_name must fill'})
      return;
    }
*/
    //console.log('groupname:', req.param('group_name'));
    Devgroup.findOneByName(req.param('group_name'))
    .populate('devcurdatas', {skip: page*limit, limit: limit})
    //.populate('devcurdatas')
    .then(function(group) {
      if (undefined === group) {
        res.json(200, []);
      } else {
        var ids = [];
        //console.log(JSON.stringify(group, null, 2));
        //_.forEach(group.devcurdatas.slice(page*limit, page*limit+limit), function(devinfo) {
        _.forEach(group.devcurdatas, function(devinfo) {
          ids.push(devinfo.id);
        });

        DevCurData.getDevInfoByIDList(req, ids, true)
        .then(function(result) {
          res.json(200, result);
        });
      }
    })
    .catch(function(e) {
      sails.log.error('get device list error: '+e.stack);
    });

  },
	
};

