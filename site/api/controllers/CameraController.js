/**
 * Created by shuyi on 16-3-28.
 */

var Promise = require('bluebird'),
  _ = require('util'),
  is = require('is_js');

module.exports = {
  /**
   * get the accessToken-
   * @param req
   * @param res
   */
  getAccessToken: function (req, res) {
    var result = {};
    result.result = 'Failed';

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          result.msg = sails.config.errorcode.E401.detail;
          res.json(result);
        } else {
          CameraService.getAccessToken()
            .then(function (value) {
              result.result = 'OK';
              result.msg = value;
              res.json(200, result);
            }).fail(function () {
              result.msg = '服务器发生错误';
              res.json(200, result);
            })
        }
      });
  },

  getCameraList: function (req, res) {
    var result = {};
    result.result = 'Failed';

    /*    CameraService.getCameraList()
     .then(function (value) {
     res.json(value);
     })*/

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          result.msg = sails.config.errorcode.E401.detail;
          res.json(200, result);
        } else {
          CameraService.getCameraList()
            .then(function (value) {
              res.json(200, value);
            })
        }
      });
  },

  /**
   * used to get the latest cameralist by the admin
   * @param req
   * @param res
   */
  refreshCameraList: function (req, res) {
    var result = {};
    result.result = 'Failed';

    CameraService.getLatestCameraList()
      .then(function () {
        result.result = 'OK';
        result.msg = '刷新成功';
        res.json(200, result);
      })
  },

  /**
   * assign a camera to some user
   * @param req
   * @param res
   */
  bindUserCamera: function (req, res) {
    var username = req.body.username,
      deviceSerial = req.body.deviceSerial;
    var result = {};
    result.result = 'Failed';

    if (undefined === username || null === username) {
      result.msg = '请提供用户名';
      res.json(200, result);
    }

    if (undefined === deviceSerial || null === deviceSerial) {
      result.msg = '请提供摄像头序列号';
      res.json(200, result);
    }

    CameraService.checkCameraLegal(deviceSerial)
      .then(function (isLegal) {
        if (isLegal) {
          Camera.checkExist(deviceSerial)
            .then(function (camera) {
              var isExist = is.not.undefined(camera);
              if (isExist) {
                result.msg = '该摄像头已经属于用户' + camera.username + '.';
                res.json(200, result);
              } else {
                var newCamera = {
                  username: username,
                  deviceSerial: deviceSerial
                };
                Camera.create(newCamera)
                  .then(function (camera) {
                    if (undefined === camera) {
                      result.msg = '分配摄像头发生未知错误，请通知管理员';
                    } else {
                      result.result = 'OK';
                      result.msg = '分配摄像头成功';
                    }
                    res.json(200, result);
                  })
              }
            })
        } else {
          result.msg = '添加的摄像头编号不合法';
          res.json(200, result);
        }
      })
  },

  /**
   * delete the camera from some user
   * @param req
   * @param res
   */
  unbindUserCamera: function (req, res) {
    var username = req.body.username,
      deviceSerial = req.body.deviceSerial;
    var result = {};
    result.result = 'Failed';

    if (undefined === username || null === username) {
      result.msg = '请提供用户名';
      res.json(200, result);
    }

    if (undefined === deviceSerial || null === deviceSerial) {
      result.msg = '请提供摄像头序列号';
      res.json(200, result);
    }

    var query = {
      username: username,
      deviceSerial: deviceSerial
    };
    Camera.destroy(query)
      .then(function (record) {
        if (0 === record.length) {
          result.msg = '删除用户摄像头失败';
        } else {
          result.result = 'OK';
          result.msg = '删除用户摄像头成功';
        }
        res.json(200, result);
      })
  },

  /**
   * check whether the camera belongs to some user
   * @param req
   * @param res
   */
  checkUserCamera: function (req, res) {
    var deviceSerial = req.param('deviceSerial');
    var smartGateSn = req.param('smartGateSn');
    var result = {};
    result.result = 'Failed';

    if (undefined === smartGateSn || null === smartGateSn) {
      result.msg = '主机序列号不合法';
      res.json(200, result);
    }

    if (undefined === deviceSerial || null === deviceSerial) {
      result.msg = '请提供摄像头序列号';
      res.json(200, result);
    }

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          result.msg = sails.config.errorcode.E401.detail;
          res.json(200, result);
        } else {
          Camera.checkUserCameraLegal(username, deviceSerial)
            .then(function (isLegal) {
              if (isLegal) {
                //check whether the camera has been added to some other smartgate
                Device.getOwner(deviceSerial)
                  .then(function (oldSn) {
                    if (undefined === oldSn || 'unknown' === oldSn || smartGateSn === oldSn) {
                      result.result = 'OK';
                      result.msg = '';
                    } else {
                      result.msg = '请从主机' + oldSn + '上将该摄像头删除，然后再次尝试添加！';
                    }
                    res.json(200, result);
                  })
              } else {
                result.msg = '摄像头不属于该用户';
                res.json(200, result);
              }
            })
        }
      });
  },

  /**
   * get some camera's info
   * @param req
   * @param res
   */
  getCameraInfo: function (req, res) {
    var deviceSerial = req.params['deviceSerial'];
    var result = {};
    result.result = 'Failed';

    if (null === deviceSerial || undefined === deviceSerial) {
      result.msg = '请提供摄像头序列号';
      res.json(200, result);
    }

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          result.msg = sails.config.errorcode.E401.detail;
          res.json(result);
        } else {
          Camera.checkUserCameraLegal(username, deviceSerial)
            .then(function (isLegal) {
              if (isLegal) {
                CameraService.getCameraList()
                  .then(function (list) {
                    result.result = 'OK';
                    //result.msg = JSON.stringify(list[deviceSerial]);
                    result.msg = list[deviceSerial];
                    res.json(200, result);
                  });

              } else {
                isAdminCamera(deviceSerial,username)
                  .then(function (isAdminCamera) {
                    if(isAdminCamera){
                      CameraService.getCameraList()
                        .then(function (list) {
                          result.result = 'OK';
                          //result.msg = JSON.stringify(list[deviceSerial]);
                          result.msg = list[deviceSerial];
                          res.json(200, result);
                        });
                    }else{
                      result.msg = '摄像头不属于该用户';
                      res.json(200,result);
                    }
                  })
              }
            })
        }
      });
  },

  /**
   * assign the liveurl to the camera
   * @param req
   * @param res
   */
  bindCameraLiveUrl: function (req, res) {
    var deviceSerial = req.body.deviceSerial,
      liveUrl = req.body.liveurl;
    var result = {};
    result.result = 'Failed';

    if (undefined === liveUrl || null === liveUrl) {
      result.msg = '请提供摄像头直播地址';
      res.json(200, result);
    }

    if (undefined === deviceSerial || null === deviceSerial) {
      result.msg = '请提供摄像头序列号';
      res.json(200, result);
    }

    CameraService.checkCameraLegal(deviceSerial)
      .then(function (isLegal) {
        if (isLegal) {

          CameraLiveUrl.checkCameraExist(deviceSerial)
            .then(function (camera) {
              var isExist = is.not.undefined(camera);
              if (isExist) {
                result.msg = '该摄像头已绑定直播地址，请先将原地址解绑！';
                res.json(200, result);
              } else {
                CameraLiveUrl.checkLiveUrlExist(liveUrl)
                  .then(function (camera) {
                    var isExist = is.not.undefined(camera);
                    if (isExist) {
                      result.msg = '该地址已经被绑定到摄像头' + camera.deviceSerial + '，请先与原摄像头解绑！'
                      res.json(200, result);
                    } else {
                      var newCameraLiveUrl = {
                        deviceSerial: deviceSerial,
                        liveurl: liveUrl
                      };

                      CameraLiveUrl.create(newCameraLiveUrl)
                        .then(function (cameraLiveUrl) {
                          if (undefined === cameraLiveUrl) {
                            result.msg = '绑定直播地址发生未知错误，请通知管理员';
                          } else {
                            result.result = 'OK';
                            result.msg = '绑定直播地址成功';
                          }
                          res.json(200, result);
                        })
                    }
                  })
              }
            })
        } else {
          result.msg = '摄像头编号不合法';
          res.json(200, result);
        }
      })
  },

  /**
   * unbind the liveurl to the camera
   * @param req
   * @param res
   */
  unbindCameraLiveUrl: function (req, res) {
    var deviceSerial = req.body.deviceSerial,
      liveUrl = req.body.liveurl;
    var result = {};
    result.result = 'Failed';

    if (undefined === liveUrl || null === liveUrl) {
      result.msg = '请提供摄像头直播地址';
      res.json(200, result);
    }

    if (undefined === deviceSerial || null === deviceSerial) {
      result.msg = '请提供摄像头序列号';
      res.json(200, result);
    }

    var query = {
      deviceSerial: deviceSerial,
      liveurl: liveUrl
    };

    CameraLiveUrl.destroy(query)
      .then(function (record) {
        if(0 === record.length){
          result.msg = '解除绑定失败！';
        }else{
          result.result = 'OK';
          result.msg = '解除绑定'
        }
        res.json(200,result);
      })
  },

  /**
   * get the camera's liveurl
   * @param req
   * @param res
   */
  getCameraLiveUrl: function (req, res) {
    var deviceSerial = req.params['deviceSerial'],
      result = {};
    result.result = 'Failed';

    if(undefined === deviceSerial){
      result.msg = '请提供摄像头序列号';
      res.json(200,result);
    }

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          result.msg = sails.config.errorcode.E401.detail;
          res.json(200, result);
        } else {
          CameraLiveUrl.findOne({deviceSerial: deviceSerial})
            .then(function (cameraLiveUrl) {

              if(null === cameraLiveUrl || undefined === cameraLiveUrl){
                result.msg = '该摄像头未分配直播地址，无法直播！';
              }else{
                result.result = 'OK';
                result.msg = cameraLiveUrl.liveurl;
              }
              res.json(200,result);
            })
        }
      });
  },
};

/**
 * check whether the camera belongs to the admin(username)
 * @param deviceSerial
 * @param username
 */
function isAdminCamera(deviceSerial,username){
  return new Promise(function (resolve, reject) {
    Device.findOne({sn:deviceSerial})
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