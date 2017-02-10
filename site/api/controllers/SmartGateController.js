/**
 * SmartGateController
 *
 * @description :: Server-side logic for managing Smartgates
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require('bluebird'),
  _ = require('lodash');

module.exports = {
  /**
   * update the smartgate's alias
   * @param req
   * @param res
   */
  updateAlias: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else if (null === req.params['id']) {
          res.json(sails.config.errorcode.E505.code, sails.config.errorcode.E505.detail);
        } else {
          var alias = req.body.alias,
            smartGateSn = req.params['id'];
          SmartGateService.updateAlias(smartGateSn, alias)
            .then(function (result) {
              res.json('200', result);
            });
        }
      });
  },

  /**
   * return the num of smartgates and online smartgates
   * @param req
   * @param res
   */
  getTotal: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          RedisService.getTotal()
            .then(function (result) {
              /**
               * result{
               * smartgate_total_num:0
               * device_total_num:0
               * online_smartgate_num:0
               * online_device_num:0
               * }
               */
              res.json(200, result);
            });
        }
      });
  },

  /**
   * get the online/all smartgate num of some user
   * @param req
   * @param res
   */
  getTotalByUser: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          RedisService.getTotalByUser(username)
            .then(function (result) {
              /**
               * smartgate_total_num:0
               * smartgate_online_num:0
               */
              res.json(200, result);
            })
        }
      })
  },

  /**
   * get some smartgate's info
   * @param req
   * @param res
   */
  getInfo: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else if (null === req.params['id']) {
          res.json(sails.config.errorcode.E502.code, sails.config.errorcode.E502.detail);
        } else {
          var smartGateSn = req.params['id'];
          RedisService.getLatestSmartGateData(smartGateSn)
            .then(function (data) {
              res.json(200, data);
            });
        }
      });
  },

  /**
   * get all the smartgates's infos
   * @param req
   * @param res
   */
  getAllSmartGate: function (req, res) {

    var limit = ParamService.getPageLimit(req);
    var page = ParamService.getPageNum(req);
    //var isgrouped = ParamService.getIsGrouped(req);


    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          var result = [];
          SmartGate.find()
            .paginate({page: page, limit: limit})
            .then(function (records) {
              Promise.map(records, function (smartgate) {
                return new Promise(function (resolve, reject) {
                  RedisService.getLatestSmartGateData(smartgate.sn)
                    .then(function (data) {
                      result.push(data);
                      resolve();
                    })
                })
              }).then(function () {
                res.json(200, result);
              });
            })
        }
      });
  },

  /**
   * delete an enddevice from the smartgate
   * @param req
   * @param res
   */
  deleteEndDevice: function (req, res) {
    var smartGateSn = req.params['smartgate_sn'],
      endDeviceSn = req.params['device_sn'],
      result = {};

    if (undefined === smartGateSn || undefined === endDeviceSn) {
      result.result = 'Failed';
      result.msg = 'need both smartgate_sn and device_sn';
      res.json(200, result);
    }

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          RedisService.getSmartGateSnsByUser(username)
            .then(function (smartgates) {
              if (_.includes(smartgates, smartGateSn)) {
                RedisService.getDeviceSnsBySmarGate(smartGateSn)
                  .then(function (devices) {
                    if (_.includes(devices, endDeviceSn)) {
                      RedisService.deleteDevice(smartGateSn, endDeviceSn)
                        .then(function () {     //delete from the db
                          Device.destroy()
                            .where({sn: endDeviceSn})
                            .then(function (record) {
                              if(record.length > 0){
                                result.result = 'OK',
                                  result.msg = 'Delete OK.';
                                res.json(200, result)
                              }else{
                                result.result = 'Failed',
                                  result.msg = 'Delete Failed.';
                                res.json(200, result)
                              }
                            })
                        })
                    } else {
                      result.result = 'Failed';
                      result.msg = 'The device does not belong to the smartgate.'
                      res.json(200, result);
                    }
                  })
              } else {
                result.result = 'Failed';
                result.msg = 'The smartgate does not belong to you.'
                res.json(200, result);
              }
            }
          )
        }
      }
    );
  },

  /**
   * delete the enddevice from the smartgate by the web-user (used when device is broken)
   * @param req
   * @param res
   */
  deleteEndDeviceWeb: function (req, res) {
    var smartGateSn = req.params['smartgate_sn'],
      endDeviceSn = req.params['device_sn'],
      result = {};

    if (undefined === smartGateSn || undefined === endDeviceSn) {
      result.result = 'Failed';
      result.msg = 'need both smartgate_sn and device_sn';
      res.json(200, result);
    }

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          RedisService.getSmartGateSnsByUser(username)
            .then(function (smartgates) {
              if (_.includes(smartgates, smartGateSn)) {
                RedisService.getDeviceSnsBySmarGate(smartGateSn)
                  .then(function (devices) {
                    if (_.includes(devices, endDeviceSn)) {
                      RedisService.deleteDeviceWeb(smartGateSn, endDeviceSn)
                        .then(function () {     //delete from the db
                          Device.destroy()
                            .where({sn: endDeviceSn})
                            .then(function (record) {
                              if (record.length > 0) {
                                result.result = 'OK',
                                  result.msg = 'Delete OK.';
                                res.json(200, result)
                              } else {
                                result.result = 'Failed',
                                  result.msg = 'Delete Failed.';
                                res.json(200, result)
                              }
                            })
                        })
                    } else {
                      result.result = 'Failed';
                      result.msg = 'The device does not belong to the smartgate.'
                      res.json(200, result);
                    }
                  })
              } else {
                result.result = 'Failed';
                result.msg = 'The smartgate does not belong to you.'
                res.json(200, result);
              }
            }
          )
        }
      }
    );
  },

  /**
   * check whether the enddevice has belonged
   * to some smartgate
   * @param req
   * @param res
   */
  checkEndDeviceLegal: function (req, res) {
    var smartGateSn = req.params['smartgate_sn'],
      endDeviceSn = req.params['device_sn'],
      result = {};

    if (undefined === smartGateSn || undefined === endDeviceSn) {
      result.result = 'Failed';
      result.msg = 'need both smartgate_sn and device_sn';
      res.json(200, result);
    }

    Device.getOwner(endDeviceSn)
      .then(function (oldSn) {
        if (undefined === oldSn || 'unknown' === oldSn || smartGateSn === oldSn) {
          result.result = 'OK';
        } else {
          result.result = 'Failed';
          result.msg = '请从主机' + oldSn + '上将该设备删除，然后再次尝试配对！';
        }
        res.json(200, result);
      })

  },

  /**
   * check whether the smartgate belongs to the user
   * @param req
   * @param res
   */
  checkSmartGateUserLegal: function (req, res) {
    var smartGateSn = req.params['smartgate_sn'],
      username = req.params['username'],
      result = {};

    if (undefined === smartGateSn || undefined == username) {
      result.result = 'Failed';
      result.msg = 'need both smartgate_sn and username';
      res.json(200, result);
    }

    RedisService.getSmartGateSnsByUser(username)
      .then(function (smartGateSns) {
        if (_.includes(smartGateSns, smartGateSn)) {
          result.result = 'OK';
          result.msg = 'The smartgate belongs to the user.'
        } else {
          result.result = 'Failed';
          result.msg = 'The smartgate does not belong to the user.'
        }
        res.json(200, result);
      })
  },

  /**
   * get some smartgate's cameras
   * @param req
   * @param res
   */
  getCameras: function (req, res) {
    var result = {};
    result.result = 'Failed';
    var smartGateSn = req.params['smartgate_sn'];
    if (undefined === smartGateSn) {
      result.msg = '请提供合法的主机SN号';
      res.json(200, result);
      return;
    }

    var devType = 'cameraip';       //default 'cameraip'

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          SmartGateService.getCameras(smartGateSn, devType)
            .then(function (cameras) {
              result.cameras = cameras;
              result.result = 'OK';
              res.json(200, result);
            })
        }
      });
  },

  /**
   * add a camera to some smartgate
   * @param req
   * @param res
   */
  addCamera: function (req, res) {
    var result = {};
    result.result = 'Failed';

    /*    var smartGateSn = 'YBF00115000000019C',
      cameraSn = 'camera1'
    if (null === smartGateSn || undefined === smartGateSn) {
      result.msg = '请提供合法的主机SN号';
      res.json(200, result);
      return;
    }

    if (null === cameraSn || undefined === cameraSn) {
      result.msg = '请提供合法的摄像头SN号';
      res.json(200, result);
      return;
    }
var  username = 'shuyi';
    //1.check whether the smartgate belongs to the user
    RedisService.getSmartGateSnsByUser(username)
      .then(function (smartGateSns) {
        if (_.includes(smartGateSns, smartGateSn)) {
          //2.check whether the camera belongs to other smartgate
          Device.getOwner(cameraSn)
            .then(function (oldSn) {
              if (undefined === oldSn || 'unknown' === oldSn || smartGateSn === oldSn) {

                var camera = {};
                camera.sn = cameraSn,
                  camera.dev_name = '摄像头1',
                  camera.dev_alias = '',
                  camera.dev_type = 'cameraip',      // default 'cameraip'
                  camera.owner = smartGateSn,
                  camera.user = 'admin',
                  camera.password = 'code1';

                // the camera is not in the db
                if (undefined === oldSn) {
                  Device.create(camera)
                    .then(function (newCamera) {
                      if (null === newCamera || undefined === newCamera) {
                        result.msg = '绑定失败！'
                      } else {
                        result.result = 'OK';
                        result.msg = '绑定成功！';
                      }
                      res.json(200, result);
                    })
                } else if ('unknown' === oldSn) {     //new device
                  Device.destroy({sn: camera.sn})
                    .then(function (record) {
                      Device.create(camera)
                        .then(function (newCamera) {
                          if (null === newCamera || undefined === newCamera) {
                            result.msg = '绑定失败！'
                          } else {
                            result.result = 'OK';
                            result.msg = '绑定成功！';
                          }
                          res.json(200, result);
                        })
                    })
                } else {
                  result.msg = '该摄像头已经属于本主机！';
                  res.json(200, result);
                }
              } else {
                result.result = 'Failed';
                result.msg = '请将该摄像头与主机' + oldSn + '解除绑定，然后重新尝试添加！';
                res.json(200, result);
                return;
              }
            })
        } else {
          result.msg = '此主机不属于该用户';
          res.json(200, result);
          return;
        }
      })*/

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          var smartGateSn = req.body.smartgate_sn,
            cameraSn = req.body.dev_sn;
          if (null === smartGateSn || undefined === smartGateSn) {
            result.msg = '请提供合法的主机SN号';
            res.json(200, result);
            return;
          }

          if (null === cameraSn || undefined === cameraSn) {
            result.msg = '请提供合法的摄像头SN号';
            res.json(200, result);
            return;
          }

          //1.check whether the smartgate belongs to the user
          RedisService.getSmartGateSnsByUser(username)
            .then(function (smartGateSns) {
              if (_.includes(smartGateSns, smartGateSn)) {
                //2.check whether the camera belongs to other smartgate
                Device.getOwner(cameraSn)
                  .then(function (oldSn) {
                    if (undefined === oldSn || 'unknown' === oldSn || smartGateSn === oldSn) {

                      var camera = {};
                      camera.sn = cameraSn,
                        camera.dev_name = req.body.dev_name,
                        camera.dev_alias = '',
                        camera.dev_type = req.body.dev_type,      // default 'cameraip'
                        camera.owner = smartGateSn,
                        camera.user = 'admin',
                        camera.password = req.body.password;

                      // the camera is not in the db
                      if (undefined === oldSn) {
                        Device.create(camera)
                          .then(function (newCamera) {
                            if (null === newCamera || undefined === newCamera) {
                              result.msg = '绑定失败！'
                            } else {
                              result.result = 'OK';
                              result.msg = '绑定成功！';
                            }
                            res.json(200, result);
                          })
                      } else if ('unknown' === oldSn) {     //new device
                        Device.destroy({sn: camera.sn})
                          .then(function (record) {
                            Device.create(camera)
                              .then(function (newCamera) {
                                if (null === newCamera || undefined === newCamera) {
                                  result.msg = '绑定失败！'
                                } else {
                                  result.result = 'OK';
                                  result.msg = '绑定成功！';
                                }
                                res.json(200, result);
                              })
                          })
                      } else {
                        result.msg = '该摄像头已经属于本主机！';
                        res.json(200, result);
                      }
                    } else {
                      result.result = 'Failed';
                      result.msg = '请将该摄像头与主机' + oldSn + '解除绑定，然后重新尝试添加！';
                      res.json(200, result);
                      return;
                    }
                  })
              } else {
                result.msg = '此主机不属于该用户';
                res.json(200, result);
                return;
              }
            })
        }
      });

  },

  /**
   * delete a camera from some smartgate
   * @param req
   * @param res
   */
  deleteCamera: function (req, res) {
    var result = {};
    result.result = 'Failed';

    var smartGateSn = req.params['smartgate_sn'],
      cameraSn = req.params['camera_sn'];

    if (undefined === smartGateSn || undefined === cameraSn) {
      result.result = 'Failed';
      result.msg = 'need both smartgate_sn and camera_sn';
      res.json(200, result);
      return;
    }


    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          RedisService.getSmartGateSnsByUser(username)
            .then(function (smartgates) {
              if (_.includes(smartgates, smartGateSn)) {
                Device.getOwner(cameraSn)
                  .then(function (oldSn) {
                    if (smartGateSn === oldSn) {
                      Device.destroy({sn: cameraSn})
                        .then(function (record) {
                          result.result = 'OK';
                          result.msg = '解除绑定成功';
                          res.json(200, result);
                        })
                    } else {
                      result.msg = '该摄像头不属于这台主机';
                      res.json(200, result);
                    }
                  })
              } else {
                result.msg = 'The smartgate does not belong to you.'
                res.json(200, result);
              }
            })
          ;
        }
      });
  },

  /**
   * update the camera's name
   * @param req
   * @param res
   */
  updateCameraName: function (req, res) {
    var result = {};
    result.result = 'Failed';

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          var smartGateSn = req.body.smartgate_sn;
          var cameraSn = req.body.camera_sn;
          var name = req.body.name;
          if (null === smartGateSn || undefined === smartGateSn || null === name || undefined === name || null === cameraSn || undefined === cameraSn) {
            result.msg = '请提供合法的主机SN、摄像头SN和摄像头名称';
            res.json(200, result);
            return;
          }

          Device.getOwner(cameraSn)
            .then(function (oldSn) {
              if (smartGateSn === oldSn) {
                Device.update({sn: cameraSn},{dev_name: name})
                  .then(function (record) {
                    result.result = 'OK';
                    result.msg = '更新摄像头名称成功';
                    res.json(200, result);
                  })
              } else {
                result.msg = '该摄像头不属于这台主机';
                res.json(200, result);
              }
            })
        }
      });
  }
};

