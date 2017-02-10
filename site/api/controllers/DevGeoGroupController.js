var Promise = require('bluebird');

function getGroupCount(id) {
  return new Promise(function(resolve, reject) {


    devcurdata_devgeogroups__devgeogroup_devcurdatas.count({devgeogroup_devcurdatas: id}, function(err, num) {
      if (err) resolve(0);
      resolve(num);
    });


/*
    devcurdata_devgeogroups__devgeogroup_devcurdatas.find({devgeogroup_devcurdatas: id}, function(err, records) {
      console.log('----------------', records.length);
      if (err) resolve(0);

      var x = _.uniq( _.collect(records, function( x ){
        return JSON.stringify( x );
      }));
      console.log('----------------', x.length);

      resolve(x.length);
    });
*/
  });
}

function getGroupCountByName(name) {
  return new Promise(function(resolve, reject) {

    DevGeoGroup.findOne({name: name})
    .then(function(group) {
/*
      devcurdata_devgeogroups__devgeogroup_devcurdatas.find({devgeogroup_devcurdatas: group.id}, function(err, records) {
        //console.log('err:', err, 'num:', num);
        if (err) resolve(0);
        resolve(records.length);
      });
*/
      devcurdata_devgeogroups__devgeogroup_devcurdatas.find({devgeogroup_devcurdatas: group.id}, function(err, records) {
        //console.log('err:', err, 'num:', num);
        if (err) resolve(0);

        var x = _.uniq( _.collect(records, function( x ){
          return JSON.stringify( x );
        }));

        resolve(x.length);
      });

    });
  });
}

module.exports = {
  index: function(req, res) {
    var limit = ParamService.getPageLimit(req); 
    var page  = ParamService.getPageNum(req); 

    DevGeoGroup.find()
    .paginate({page: page, limit: limit})
    .then(function(groups) {
      async.each(groups, function(group, cb) {
        devcurdata_devgeogroups__devgeogroup_devcurdatas.count({devgeogroup_devcurdatas: group.id}, function(err, num) {
          group.count = num;
          //console.log('------------>', err, ', num:', num);
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


  getProvinceList: function(req, res) {
    var limit = ParamService.getPageLimit(req); 
    var page  = ParamService.getPageNum(req); 

    DevGeoGroup.find()
    .paginate({page: page, limit: limit})
    .where({scope: 'province'})
    .sort({name: 'asc'})
    //.sort({name: 'desc'})
    .then(function(groups) {
      var result = [];

      var countGroups = [];
      groups.forEach(function(group) {
        countGroups.push(getGroupCount(group.id).then(function(num) {
          group.count = num;
          return group;
        })
        .then(function(group) {
          var data = {};
          if (group.count > 0) {
            data.name = group.name;
            data.count = group.count;
            result.push(data);
          }
        })
        );
      });

      Promise.all(countGroups).then(function() {
        res.json(200, result);
      });
    })
    .catch(function(e) {
      sails.log.error('get province list'+e.stack);
    });

  },


  getProvinceCityList: function(req, res) {
    var limit = ParamService.getPageLimit(req); 
    var page  = ParamService.getPageNum(req); 
    var provinceName = req.param('name');

    DevGeoGroup.find({parent_name: provinceName})
    .paginate({page: page, limit: limit})
    .then(function(groups) {
      var result = [];

      var countGroups = [];
      groups.forEach(function(group) {
        countGroups.push(getGroupCount(group.id).then(function(num) {
          //console.log('------------------------', num);
          group.count = num;
          return group;
        })
        .then(function(group) {
          var groupInfo = {};

          if (group.count > 0) {
            groupInfo.name = group.name;
            groupInfo.count = group.count;
            groupInfo.location = group.location;
            result.push(groupInfo);
          }
        })
        );
      });

      Promise.all(countGroups).then(function() {
        res.json(200, result);
      });

    })
    .catch(function(e) {
      sails.log.error('get province list'+e.stack);
    });

  },



  getCityList: function(req, res) {
    var limit = ParamService.getPageLimit(req); 
    var page  = ParamService.getPageNum(req); 

    var name = req.param('name');
    var result = [];

    DevGeoGroup.findOne({name: name})
    .populate('devcurdatas', {limit: limit})
    .then(function(group) {
      var getEachDataInfo = [];

      group.devcurdatas.forEach(function(devcurdata) {
        getEachDataInfo.push(
          Location.findOne(devcurdata.location)
          .then(function(location) {
            //console.log('----------------', JSON.stringify(devcurdata, null, 2));
            var info = {};
            info.dev_type = devcurdata.dev_type;
            info.dev_uuid = devcurdata.dev_uuid;
            info.common = {
              dev_name: devcurdata.content.body.common.dev_name,
              location: {lat: location.lat, lng: location.lng},
              plant_name: devcurdata.content.body.common.plant_name,
            };

            info.components = [];
            devcurdata.content.body.components.forEach(function(component) {
              var cdata = {};
              cdata.component_id = component.component_id;

              //info.components.push(cdata);
              info.components.push(component);
            });

            result.push(info);
          })
        );
/*
        Location.find(devcurdata.location)
        .then(function(location) {
          console.log('8888888888', JSON.stringify(location, null ,2));
        });
        console.log('----------------', JSON.stringify(devcurdata, null, 2));
        var info = {};
        info.dev_type = devcurdata.dev_type;
        info.dev_uuid = devcurdata.dev_uuid;

        result.push(info);
*/
      });

      Promise.all(getEachDataInfo)
      .then(function() {
        res.json(200, result);
      });

      //res.json(200, result);
    });

  },


  getPadList: function(req, res) {
    var limit = ParamService.getPageLimit(req); 
    var page  = ParamService.getPageNum(req); 

    var name = req.param('name');
    var plant_name = req.param('plant_name');
    var result = [];

    DevGeoGroup.findOne({name: name})
    .populate('devcurdatas', {limit: limit})
    .then(function(group) {
      var getEachDataInfo = [];

      group.devcurdatas.forEach(function(devcurdata) {
        getEachDataInfo.push(
          Location.findOne(devcurdata.location)
          .then(function(location) {
            //console.log('----------------', JSON.stringify(devcurdata, null, 2));
            if (plant_name == devcurdata.content.body.common.plant_name) {
              var info = {};
              info.dev_type = devcurdata.dev_type;
              info.dev_uuid = devcurdata.dev_uuid;
              info.common = {
                dev_name: devcurdata.content.body.common.dev_name,
                location: {lat: location.lat, lng: location.lng},
                plant_name: devcurdata.content.body.common.plant_name,
              };

              info.components = [];
              devcurdata.content.body.components.forEach(function(component) {
                var cdata = {};
                cdata.component_id = component.component_id;

                //info.components.push(cdata);
                info.components.push(component);
              });

              result.push(info);
            }
          })
        );
/*
        Location.find(devcurdata.location)
        .then(function(location) {
          console.log('8888888888', JSON.stringify(location, null ,2));
        });
        console.log('----------------', JSON.stringify(devcurdata, null, 2));
        var info = {};
        info.dev_type = devcurdata.dev_type;
        info.dev_uuid = devcurdata.dev_uuid;

        result.push(info);
*/
      });

      Promise.all(getEachDataInfo)
      .then(function() {
        res.json(200, result);
      });

      //res.json(200, result);
    });

  },


  getProvinceSumInfo: function(req, res) {
    var provinceName = req.param('province_name');
    var cityName = req.param('city_name');
    var plantName = req.param('plant_name');

    if (plantName === undefined) plantName = 'all';
    if (cityName === undefined)  cityName = 'all';

    if (cityName == 'all') {
      getAllCityInfo(provinceName, plantName)
      .then(function(result) {
        res.json(200, result);
      });
    } else {
      getOneCityInfo(cityName, plantName)
      .then(function(result) {
        res.json(200, result);
      });
    }
  },


  getProvinceLocation: function(req, res) {
    var provinceName = req.param('province_name');
    var cityName = req.param('city_name');
    var plantName = req.param('plant_name');

    if (plantName === undefined) plantName = 'all';
    if (cityName === undefined)  cityName = 'all';

    if (cityName == 'all') {
      getAllCityLocation(provinceName, plantName)
      .then(function(result) {
        res.json(200, result);
      });
    } else {
      getOneCityLocation(cityName, plantName)
      .then(function(result) {
        res.json(200, result);
      });
    }
  },


};


function getAllCityInfo(provinceName, plantName) {

  return DevGeoGroup.find({parent_name: provinceName})
  .populate('devcurdatas')
  .then(function(cities) {

    var count = 0;
    var area = 0;
    var expectation = 0;
    var harvest = []; 

    _(cities).forEach(function(city) {
      _(city.devcurdatas).forEach(function(device) {
        if (device.content.body.common.plant_name == plantName || plantName == 'all') {
          count++;
          area += parseInt(device.content.body.common.area);
          expectation += parseInt(device.content.body.common.area);
          var index = _.findIndex(harvest, {month: parseInt(device.content.body.common.harvest_time)})
          if (index < 0) {
            harvest.push({month: parseInt(device.content.body.common.harvest_time), weight: parseInt(device.content.body.common.harvest_weight)});
          } else {
            harvest[index].weight = parseInt(harvest[index].weight) + parseInt(device.content.body.common.harvest_weight);
          }
        }
      });
    });

    return {
      count: count,
      area: area,
      expectation: expectation,
      harvest: harvest
    };
  })
  .fail(function(err) {
  });

}

function getOneCityInfo(cityName, plantName) {

  return DevGeoGroup.findOne({name: cityName})
  .populate('devcurdatas')
  .then(function(city) {
    var count = 0;
    var area = 0;
    var expectation = 0;
    var harvest = []; 
    _(city.devcurdatas).forEach(function(device) {
      if (device.content.body.common.plant_name == plantName || plantName == 'all') {
        count++;
        area += parseInt(device.content.body.common.area);
        expectation += parseInt(device.content.body.common.area);
        var index = _.findIndex(harvest, {month: parseInt(device.content.body.common.harvest_time)})
        if (index < 0) {
          harvest.push({month: parseInt(device.content.body.common.harvest_time), weight: parseInt(device.content.body.common.harvest_weight)});
        } else {
          harvest[index].weight = parseInt(harvest[index].weight) + parseInt(device.content.body.common.harvest_weight);
        }
      }
    });

    return {
      count: count,
      area: area,
      expectation: expectation,
      harvest: harvest
    };
  })
  .fail(function(err) {
  });

}


function getAllCityLocation(provinceName, plantName) {

  return DevGeoGroup.find({parent_name: provinceName})
  .populate('devcurdatas')
  .then(function(cities) {

    var location= []; 

    _(cities).forEach(function(city) {
      _(city.devcurdatas).forEach(function(device) {
        if (device.content.body.common.plant_name == plantName || plantName == 'all') {
          location.push({lat: parseFloat(device.content.body.common.lat), lng: parseFloat(device.content.body.common.lng)});
        }
      });
    });

    return location;
  })
  .fail(function(err) {
  });

}

function getOneCityLocation(cityName, plantName) {

  return DevGeoGroup.findOne({name: cityName})
  .populate('devcurdatas')
  .then(function(city) {
    var location = []; 
    _(city.devcurdatas).forEach(function(device) {
      if (device.content.body.common.plant_name == plantName || plantName == 'all') {
        location.push({lat: parseFloat(device.content.body.common.lat), lng: parseFloat(device.content.body.common.lng)});
      }
    });

    return location;
  })
  .fail(function(err) {
  });

}


