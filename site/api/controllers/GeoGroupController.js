/**
 * GeoGroupController
 *
 * @description :: Server-side logic for managing Geogroups
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require('bluebird'),
  _ = require('lodash');

module.exports = {
  /**
   * get the province list with the smartgates' number
   * @param req
   * @param res
   */
  getProvinceList: function (req, res) {
    var limit = ParamService.getPageLimit(req);
    var page = ParamService.getPageNum(req);

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          GeoGroup.native(function (err, collection) {
            collection.distinct('province', function (err, provinces) {
              provinces.sort();
              Promise.map(provinces, function (provinceName) {
                return new Promise(function (resolve, reject) {
                  var element = {};
                  getCountByProvince(provinceName, username)
                    .then(function (sum) {
                      element.name = provinceName;
                      element.count = sum;
                      if (sum === 0)
                        resolve(null);
                      else
                        resolve(element);
                    })
                })
              }).then(function (result) {
                _.remove(result, function (element) {
                  return element === null;
                })
                res.json(200, result);
              })
            })
          })
        }
      });
  },

  /**
   * get the city list of some province
   * @param req
   * @param res
   */
  getProvinceCityList: function (req, res) {
    var provinceName = req.param('province');

    //var provinceName = '北京市(直辖)';
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          GeoGroup.native(function (err, collection) {
            collection.distinct('city', {'province': provinceName}, function (err, cities) {
              cities.sort();
              Promise.map(cities, function (cityName) {
                return new Promise(function (resolve, reject) {
                  var element = {};
                  getCountByProvinceCity(provinceName, cityName, username)
                    .then(function (v) {
                      element.name = cityName;
                      element.count = v.sum;
                      element.lat = v.lat;
                      element.lng = v.lng;
                      resolve(element);
                    })
                })
              }).then(function (result) {
                res.json(200, result);
              })
            })
          })
        }
      })
  },

  /**
   * get the district list of some city
   * @param req
   * @param res
   */
  getProvinceCityDistictList: function (req, res) {
    var provinceName = req.param('province');
    var cityName = req.param('city');
    //var provinceName = '北京市(直辖)',
    //cityName = '北京市';

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          GeoGroup.native(function (err, collection) {
            collection.distinct('district', {'province': provinceName, 'city': cityName}, function (err, districts) {
              districts.sort();

              Promise.map(districts, function (districtName) {
                return new Promise(function (resolve, reject) {
                  var element = {};
                  getCountByProvinceCityDistrict(provinceName, cityName, districtName, username)
                    .then(function (v) {
                      element.name = districtName;
                      element.count = v.sum;
                      element.lat = v.lat;
                      element.lng = v.lng;
                      resolve(element);
                    })
                })
              }).then(function (result) {
                res.json(200, result);
              })
            })
          })
        }
      })
  },

  /**
   * get the smartgate list of some district
   * @param req
   * @param res
   */
  getSmartGateList: function (req, res) {
    var limit = ParamService.getPageLimit(req),
      page = ParamService.getPageNum(req);

    var provinceName = req.param('province'),
      cityName = req.param('city'),
      districtName = req.param('district');

    var queryCondition = {};
    if (undefined !== provinceName) {
      _.assign(queryCondition, {province: provinceName});
    }
    if (undefined !== cityName) {
      _.assign(queryCondition, {city: cityName});
    }
    if (undefined !== districtName) {
      _.assign(queryCondition, {district: districtName});
    }


    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          GeoGroup.find()
            .where(queryCondition)
            //.populate('smartgates', {limit: 0})
            .populate('smartgates')
            .then(function (result) {
              var value = [];

              RedisService.getUserInfo(username)
                .then(function (info) {
                  if (null !== info && undefined !== info) {
                    if (info.role !== 'superadmin') {
                      RedisService.getSmartGateSnsByUser(username)
                        .then(function (smartGateSns) {
                          Promise.map(result, function (singleResult) {
                            return new Promise(function (resolve, reject) {
                              Promise.map(singleResult.smartgates, function (smartgate) {
                                return new Promise(function (resolve, reject) {
                                  if (_.includes(smartGateSns, smartgate.sn)) {
                                    //value = _.union(value, smartgate);
                                    if(null === RedisService.getSmartGateStateMap()[smartgate.sn] || undefined === RedisService.getSmartGateStateMap()[smartgate.sn]){
                                      smartgate.online_state = 'offline';
                                    }else{
                                      smartgate.online_state = RedisService.getSmartGateStateMap()[smartgate.sn];
                                    }
                                    value.push(smartgate);
                                  }
                                  resolve();
                                })
                              }).then(function () {
                                resolve();
                              })
                            })
                          }).then(function () {
                            res.json(200, value);
                          })
                        })
                    } else {
                      Promise.map(result, function (singleResult) {
                        return new Promise(function (resolve, reject) {
                          value = _.union(value, singleResult.smartgates);
                          Promise.map(value, function (smartgate) {
                            return new Promise(function (resolve, reject) {

                              RedisService.getSmartGateOnlineState(smartgate.sn)
                                .then(function (state) {
                                  smartgate.online_state = state;
                                  resolve();
                                });

                              //
                              /*if(null === RedisService.getSmartGateStateMap()[smartgate.sn] || undefined === RedisService.getSmartGateStateMap()[smartgate.sn]){
                                RedisService.getSmartGateOnlineState(smartgate.sn)
                                  .then(function (state) {
                                    smartgate.online_state = state;
                                    resolve();
                                  });
                              }else{
                                smartgate.online_state = RedisService.getSmartGateStateMap()[smartgate.sn];
                                resolve();
                              }*/
                            })
                          }).then(function () {
                            resolve();
                          })
                        })
                        //value.push(singleResult.smartgates);
                      }).then(function () {
                        res.json(200, value);
                      })
                    }
                  }
                })
            })
        }
      });
  }
};

/**
 * count the number of the smartgate of some province
 * @param provinceName
 * @param username
 * @return {bluebird|exports|module.exports}
 */
function getCountByProvince(provinceName, username) {
  return new Promise(function (resolve, reject) {
    var count = 0;
    GeoGroup.find()
      .where({province: provinceName})
      .populate('smartgates')
      .then(function (provinces) {

        RedisService.getUserInfo(username)
          .then(function (info) {
            if (null !== info && undefined !== info) {
              if (info.role !== 'superadmin') {
                RedisService.getSmartGateSnsByUser(username)
                  .then(function (smartGateSns) {
                    Promise.map(provinces, function (province) {
                      return new Promise(function (resolve, reject) {

                        Promise.map(province.smartgates, function (smartgate) {
                          return new Promise(function (resolve, reject) {
                            if (_.includes(smartGateSns, smartgate.sn)) {
                              resolve(1);
                            } else {
                              resolve(0);
                            }
                          })
                        }).then(function (result) {
                          resolve(_.sum(result));
                        })
                      })
                    }).then(function (result) {
                      resolve(_.sum(result));
                    });
                  })
              } else {
                Promise.map(provinces, function (province) {
                  return new Promise(function (resolve, reject) {
                    resolve(_.size(province.smartgates));
                  })
                }).then(function (result) {
                  resolve(_.sum(result));
                })
              }
            }
          })


      })
  })
};

/**
 * count the number of the smartgate of some city
 * @param provinceName
 * @param cityName
 * @param username
 * @return {bluebird|exports|module.exports}
 */
function getCountByProvinceCity(provinceName, cityName, username) {
  return new Promise(function (resolve, reject) {
    var count = 0;
    GeoGroup.find()
      .where({province: provinceName, city: cityName})
      .populate('smartgates')
      .then(function (cities) {
        RedisService.getUserInfo(username)
          .then(function (info) {
            if (null !== info && undefined !== info) {
              if (info.role !== 'superadmin') {
                RedisService.getSmartGateSnsByUser(username)
                  .then(function (smartGateSns) {

                    Promise.map(cities, function (city) {
                      return new Promise(function (resolve, reject) {
                        Promise.map(city.smartgates, function (smartgate) {
                          return new Promise(function (resolve, reject) {
                            if (_.includes(smartGateSns, smartgate.sn)) {
                              resolve(1);
                            } else {
                              resolve(0);
                            }
                          })
                        }).then(function (result) {
                          resolve(_.sum(result));
                        })
                      })
                    }).then(function (result) {
                      var v = {};
                      v.sum = _.sum(result),
                        v.lat = cities[0].lat,
                        v.lng = cities[0].lng;
                      resolve(v);
                    })
                  })
              } else {
                Promise.map(cities, function (city) {
                  return new Promise(function (resolve, reject) {
                    resolve(_.size(city.smartgates));
                  })
                }).then(function (result) {
                  var v = {};
                  v.sum = _.sum(result),
                    v.lat = cities[0].lat,
                    v.lng = cities[0].lng;
                  resolve(v);
                })
              }
            }
          })
      })
  })
}

/**
 * count the number of the smartgate of some district
 * @param provinceName
 * @param cityName
 * @param districtName
 * @param username
 * @return {bluebird|exports|module.exports}
 */
function getCountByProvinceCityDistrict(provinceName, cityName, districtName, username) {
  return new Promise(function (resolve, reject) {
    var count = 0;
    GeoGroup.find()
      .where({province: provinceName, city: cityName, district: districtName})
      .populate('smartgates')
      .then(function (districts) {
        RedisService.getUserInfo(username)
          .then(function (info) {
            if (null !== info && undefined !== info) {
              if (info.role !== 'superadmin') {
                RedisService.getSmartGateSnsByUser(username)
                  .then(function (smartGateSns) {

                    Promise.map(districts, function (district) {
                      return new Promise(function (resolve, reject) {
                        Promise.map(district.smartgates, function (smartgate) {
                          return new Promise(function (resolve, reject) {
                            if (_.includes(smartGateSns, smartgate.sn)) {
                              resolve(1);
                            } else {
                              resolve(0);
                            }
                          })
                        }).then(function (result) {
                          resolve(_.sum(result));
                        })
                      })
                    }).then(function (result) {
                      var v = {};
                      v.sum = _.sum(result),
                        v.lat = districts[0].lat,
                        v.lng = districts[0].lng;
                      resolve(v);
                    })

                  });
              } else {
                Promise.map(districts, function (district) {
                  return new Promise(function (resolve, reject) {
                    resolve(_.size(district.smartgates));
                  })
                }).then(function (result) {
                  var v = {};
                  v.sum = _.sum(result),
                    v.lat = districts[0].lat,
                    v.lng = districts[0].lng;
                  resolve(v);
                })
              }
            }
          })


      })
  })
}