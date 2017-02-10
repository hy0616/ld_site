/**
 * Created by shuyi on 15-9-9.
 */
var Promise = require('bluebird'),
  datetime = require('./datetime'),
  _ = require('lodash'),
  redis = require('redis'),
  redis_config = sails.config.redis_config,
  pubSubClient = redis.createClient(redis_config.buffer_redis.port, redis_config.buffer_redis.host, redis_config.buffer_redis.options),
  client = redis.createClient(redis_config.buffer_redis.port, redis_config.buffer_redis.host, redis_config.buffer_redis.options),
  leancloud_config = sails.config.leancloud_config;

var smartGateState = {};

module.exports = {
  init: function () {
    initSubscribe();
  },

  /**
   * get user's unread events from the server
   * @param username
   * @returns {bluebird|exports|module.exports}
   */
  getUserEvent: function (username) {
    return new Promise(function (resolve, reject) {
      client.hgetall(redis_config.key_config.events + username, function (err, obj) {
        if (null !== obj && undefined !== obj) {
          var returnValue = [];
          _.forEach(_.values(obj), function (value) {
            returnValue.push(JSON.parse(value));
          })
          resolve(returnValue);
        } else {
          resolve({});
        }
      });
    })
  },

  /**
   * get the latest data of the smartgate
   * with the devices attached
   * @param smartGateSn
   * @return {bluebird|exports|module.exports}
   */
  getLatestSmartGateData: function (smartGateSn) {
    return new Promise(function (resolve, reject) {
      var result = {};
      result.components = [];
      client.hgetall(redis_config.key_config.smartgateinfos + smartGateSn, function (err, res) {
        //in case the res-smartgateinfo is not complete
        if (null === res || undefined === res || undefined === res.sn) {
          // query from the database
          SmartGate.findWithDevice(smartGateSn)
            .then(function (smartGate) {
              result.smartgate = _.omit(smartGate, _.isFunction);
              result.smartgate = _.omit(result.smartgate, 'devices');
              /*
               convert from integer to string;
               web use string instead of integer;
               app can use both of them;
               */
              result.smartgate.plant_time = result.smartgate.plant_time + '';
              result.smartgate.harvest_time = result.smartgate.harvest_time + '';
              result.components = smartGate.devices;
              _.forEach(result.components, function (device) {
                device.online_state = 'offline';
              })
              resolve(result);
            });
        } else {
          result.smartgate = res;
          var exists = [];
          client.hgetall(redis_config.key_config.smartgatedevice + smartGateSn, function (err, res) {
            Promise.map(_.keys(res), function (deviceSn) {
              return new Promise(function (resolve, reject) {
                client.hgetall(redis_config.key_config.deviceinfos + deviceSn, function (err, res) {
                  result.components.push(res);
                  exists.push(res.sn);
                  resolve();
                });
              });
            }).then(function () {
              SmartGateService.getCameras(smartGateSn,'cameraip')
                .then(function (cameras) {
                  _.forEach(cameras, function (camera) {
                    if(!_.includes(exists, camera.sn)){
                      result.components.push(camera);
                    }
                  })
                  /*result.components = _.union(result.components,cameras);*/
                  resolve(result);
                })
            });
          });
        }
      });
    });
  },

  /**
   * get the online/all smartgate/device num
   * @returns {bluebird|exports|module.exports}
   */
  getTotal: function () {
    return new Promise(function (resolve, reject) {
      Promise.props({
        smartgate_total_num: getValueByKey('smartgate_total_num'),
        device_total_num: getValueByKey('device_total_num'),
        online_smartgate_num: getValueByKey('current_online_smartgate_count'),
        online_device_num: getValueByKey('current_online_device_count')
      }).then(function (result) {
        resolve(result);
      });
    });
  },

  /**
   * get the online/all smartgate num of some user
   * @param username
   * @returns {bluebird|exports|module.exports}
   */
  getTotalByUser: function (username) {
    return new Promise(function (resolve, reject) {
      Promise.props({
        smartgate_total_num: getSmartGateNumByUser(username),
        smartgate_online_num: getSmartGateOnlineNumByUser(username)
      }).then(function (result) {
        resolve(result);
      })
    })
  },

  /**
   * get some user's all smartgats infos
   * @param username
   * @returns {bluebird|exports|module.exports}
   */
  getSmartGateByUser: function (username) {
    return new Promise(function (resolve, reject) {
      var result = [];
      client.hgetall(redis_config.key_config.usersmartgate + username, function (err, res) {
        Promise.map(_.keys(res), function (smartgate) {
          return new Promise(function (resolve, reject) {
            RedisService.getLatestSmartGateData(smartgate)
              .then(function (data) {
                result.push(data);
                resolve();
              })
          })
        }).then(function () {
          resolve(result);
        });
      });
    });
  },

  /**
   * get all the smartgates
   * superadmin
   */
  getAllSmartGate: function () {
    return new Promise(function (resolve, reject) {
      var result = [];

      SmartGate.findAllSns()
        .then(function (record) {
          Promise.map(record, function (singleRecord) {
            return new Promise(function (resolve, reject) {
              RedisService.getLatestSmartGateData(singleRecord.sn)
                .then(function (data) {
                  result.push(data);
                  resolve();
                })
            })
          }).then(function () {
            resolve(result);
          })
        })
    })
  },

  /**
   * get the user's all smartgates' sns
   * @param username
   * @return {bluebird|exports|module.exports}
   */
  getSmartGateSnsByUser: function (username) {
    return new Promise(function (resolve, reject) {
      client.hgetall(redis_config.key_config.usersmartgate + username, function (err, res) {
        resolve(_.keys(res));
      });
    });
  },

  /**
   * get the smartgate's all devices' sns
   * @param smartGateSn
   * @return {bluebird|exports|module.exports}
   */
  getDeviceSnsBySmarGate: function (smartGateSn) {
    return new Promise(function (resolve, reject) {
      client.hgetall(redis_config.key_config.smartgatedevice + smartGateSn, function (err, res) {
        resolve(_.keys(res));
      });
    });
  },

  /**
   * get some end-device's latest value
   * @param deviceSn
   * @return {bluebird|exports|module.exports}
   */
  getLatestDeviceData: function (deviceSn, username) {
    return new Promise(function (resolve, reject) {
      client.hgetall(redis_config.key_config.deviceinfos + deviceSn, function (err, res) {
        var smartGateSn = res.owner;
        if (null === smartGateSn || undefined === smartGateSn) {
          resolve({msg: 'wrong device sn'});
        } else {
          client.hexists(redis_config.key_config.usersmartgate + username, smartGateSn, function (err, res1) {
            if (res1 === 1) {
              resolve(res);
            } else {
              //检查是否属于admin
              isAdminDevice(deviceSn,username)
                .then(function (isAdminDevice) {
                  if(isAdminDevice){
                    resolve(res);
                  }else{
                    resolve({msg: '您无权查看该设备信息'});
                  }
                })
            }
          });
        }
      });
    });
  },

  /**
   * delete a device from the smartgate
   * @param smartGateSn
   * @param deviceSn
   * @return {bluebird|exports|module.exports}
   */
  deleteDevice: function (smartGateSn, deviceSn) {
    return new Promise(function (resolve, reject) {
      client.hdel(redis_config.key_config.smartgatedevice + smartGateSn, deviceSn, function (err, res) {
        client.del(redis_config.key_config.deviceinfos + deviceSn, function (err, res) {
          if (res === 1) {
            client.decr('current_online_device_count');
          }
          client.hdel('device_smartgate', deviceSn, function (err, res) {
            client.sadd(redis_config.key_config.deleteddevices + smartGateSn, deviceSn, function (err, res) {      //add the deleted device to the deleted-devices set.
              resolve();
            });
          });
        });
      });
    });
  },

  /**
   * delete a device from the smartgate by the web-user (used when device is broken)
   * @param smartGateSn
   * @param deviceSn
   */
  deleteDeviceWeb: function (smartGateSn, deviceSn) {
    return new Promise(function (resolve, reject) {
      client.hdel(redis_config.key_config.smartgatedevice + smartGateSn, deviceSn, function (err, res) {
        client.del(redis_config.key_config.deviceinfos + deviceSn, function (err, res) {
          if (res === 1) {
            client.decr('current_online_device_count');
          }
          client.hdel('device_smartgate', deviceSn, function (err, res) {
            resolve();
          });
        });
      });
    });
  },

  /**
   * get the user's info
   * @param username
   * @return {bluebird|exports|module.exports}
   */
  getUserInfo: function (username) {
    return new Promise(function (resolve, reject) {
      client.hgetall(redis_config.key_config.userinfos + username, function (err, res) {
        resolve(res);
      })
    })
  },

  /**
   * update or add a new user to the redis-buffer (redis_config.key_config + username + username)
   * @param username
   */
  setUserInfo: function (username) {
    User.findOne({username: username})
      .then(function (user) {
        client.hmset(redis_config.key_config.userinfos + user.username, user, function (err, res) {

        })
      })
  },

  /**
   * set the user's installationId
   * @param username
   * @param installationId
   * @return {bluebird|exports|module.exports}
   */
  setUserInstallationId1: function (username, installationId) {
    return new Promise(function (resolve, reject) {
      client.hmset('user_leancloud', username, installationId, function (err, res) {
        if (err) {
          resolve('Failed');
        } else {
          resolve('OK');
        }
      })
    })
  },

  /**
   * set the user's installationId
   * @param username
   * @param installationId
   * @return {bluebird|exports|module.exports}
   */
  setUserInstallationId: function (username, installationId) {
    return new Promise(function (resolve, reject) {

      client.hget(redis_config.key_config.userleancloud, username, function (err, res) {
        if (res !== installationId) {
          // send offline message
          PushService.pushSpecialUserCmd(res, [leancloud_config.channels.CMD], leancloud_config.cmds.OFFLINE, username);
        }

        client.hget(redis_config.key_config.leanclouduser, installationId, function (err, res) {
          if (null === res) {
            updateLeancloudUser(username, installationId)
              .then(function () {
                updateUserLeancloud(username, installationId)
                  .then(function (updateResult) {
                    resolve(updateResult);
                  });
              });
          } else {
            if (res === username) {
              updateUserLeancloud(username, installationId)
                .then(function (updateResult) {
                  resolve(updateResult);
                });
            } else {
              deleteUserLeancloud(res, installationId)
                .then(function () {
                  updateLeancloudUser(username, installationId)
                    .then(function () {
                      updateUserLeancloud(username, installationId)
                        .then(function (updateRecord) {
                          resolve(updateRecord);
                        });
                    });
                });
            }
          }
        });
      });
    });
  },

  /**
   * get the user's installationId
   * @param username
   * @return {bluebird|exports|module.exports}
   */
  getUserInstallationId: function (username) {
    return new Promise(function (resolve, reject) {
      client.hget(redis_config.key_config.userleancloud, username, function (err, res) {
        resolve(res);
      })
    })
  },

  /**
   * get the online-smartgate map
   * @return {{}}
   */
  getSmartGateStateMap: function () {
    return smartGateState;
  },

  /**
   * get the smartgate's online state
   * @param smartGateSn
   * @return {bluebird|exports|module.exports}
   */
  getSmartGateOnlineState: function (smartGateSn) {
    return new Promise(function (resolve, reject) {
      client.hget(redis_config.key_config.smartgateinfos + smartGateSn, 'online_state', function (err, res) {
        if ('online' === res) {
          smartGateState[smartGateSn] = 'online';
        } else {
          smartGateState[smartGateSn] = 'offline';
        }
        resolve(smartGateState[smartGateSn]);
      })
    })
  },
};

/**
 * init the client to subscribe message from the reveiver
 */
function initSubscribe() {
  pubSubClient.subscribe(redis_config.buffer_redis.notice_channel_config.server_to_site_channel);
  pubSubClient.on('message', function (channel, message) {
    handleSubMsg(channel, message);
  });
};

/**
 * handle the message received from the redis
 * @param channel
 * @param message
 */
function handleSubMsg(channel, message) {
  var msg = JSON.parse(message);
  var username = msg.user_name;
  if (null !== username && undefined !== username && 'unknown' !== username) {
    RedisService.getUserInstallationId(username)
      .then(function (installationId) {
        if (null !== installationId && undefined !== installationId) {
          var alarmObj = generateEventObj(msg);
          var channels = ['event'];
          PushService.pushSpecialUser(installationId, channels, alarmObj.title, alarmObj.eventStr);
        }
      })
  }
};

/**
 * get the value by the key from the redis-server
 * @param keyName
 * @returns {bluebird|exports|module.exports}
 */
function getValueByKey(keyName) {
  return new Promise(function (resolve, reject) {
    client.get(keyName, function (err, res) {
      resolve(res);
    });
  });
};

/**
 * get the smartgate num of some user
 * @param username
 * @returns {bluebird|exports|module.exports}
 */
function getSmartGateNumByUser(username) {
  return new Promise(function (resolve, reject) {
    client.hlen(redis_config.key_config.usersmartgate + username, function (err, res) {
      resolve(res);
    })
  })
};

/**
 * get the online smartgate num of some user
 * @param username
 * @returns {bluebird|exports|module.exports}
 */
function getSmartGateOnlineNumByUser(username) {
  return new Promise(function (resolve, reject) {
    client.hkeys(redis_config.key_config.usersmartgate + username, function (err, res) {
      var count = 0;
      Promise.map(res, function (smartGateSn) {
        return new Promise(function (resolve, reject) {
          client.hget(redis_config.key_config.smartgateinfos + smartGateSn, 'online_state', function (err, res) {
            if ('online' === res) {
              count++;
              smartGateState[smartGateSn] = 'online';
            } else {
              smartGateState[smartGateSn] = 'offline';
            }
            resolve();
          });
        });
      }).then(function () {
        resolve(count);
      })
    })
  })
};

/**
 * generate the event-str pushed to the mobile-terminal
 * @param msg
 * @return {string|*}
 */
function generateEventObj(msg) {
  var alarmObj = {},
    preStr = '',
    title = '';

  //event_type. refers to the receiver/config/event_config/
  switch (msg.event_type) {
    case 'notice':
      title = '系统通知';
      preStr = '【通知】';
      break;
    case 'alarm':
      title:'异常报警';
      preStr = '【报警】';
      break;
  }
  alarmObj.title = title;
  alarmObj.eventStr = preStr + msg.detail;
  return alarmObj;
};

/**
 * update the leanclouduser:
 * @param username
 * @param installationId
 * @return {bluebird|exports|module.exports}
 */
function updateLeancloudUser(username, installationId) {
  return new Promise(function (resolve, reject) {
    client.hset(redis_config.key_config.leanclouduser, installationId, username, function (err, res) {
      resolve();
    })
  })
};

/**
 * update the userleancloud:
 * @param username
 * @param installationId
 * @return {bluebird|exports|module.exports}
 */
function updateUserLeancloud(username, installationId) {
  return new Promise(function (resolve, reject) {
    client.hmset(redis_config.key_config.userleancloud, username, installationId, function (err, res) {
      if (err) {
        resolve('Failed');
      } else {
        resolve('OK');
      }
    })
  })
};

/**
 * delete from the userleancloud:
 * @param username
 * @param installationId
 * @return {bluebird|exports|module.exports}
 */
function deleteUserLeancloud(username, installationId) {
  return new Promise(function (resolve, reject) {
    client.hdel(redis_config.key_config.userleancloud, username, installationId, function (err, res) {
      resolve();
    })
  })
};

/**
 * check whether the device belongs to the admin(username)
 * @param deviceSerial
 * @param username
 */
function isAdminDevice(sn,username){
  return new Promise(function (resolve, reject) {
    Device.findOne({sn:sn})
      .then(function (device) {
        if(null === device || undefined === device){
          resolve(false);
        }else{
          var smartGateSn = device.owner;
          OwnerAdmin.findOne({admin: username}).populate('smartgates', {sn: smartGateSn})
            .then(function (ownerAdmin) {
              //does not belong to some admin
              if (null === ownerAdmin || undefined === ownerAdmin || undefined === ownerAdmin.smartgates || (ownerAdmin.smartgates.length === 0)) {
                resolve(false);
              }else{
                resolve(true);
              }
            })
        }
      })
  })
}