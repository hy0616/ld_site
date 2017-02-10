/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

//http://www.360doc.com/content/13/0715/17/11253639_300171772.shtml //第三方登陆
var Promise = require('bluebird'),
  _ = require('lodash');

module.exports = {

  /**
   * signup. register
   * @param req
   * @param res
   */
  signUp: function (req, res) {
    UserUtilService.signUp(req)
      .then(function (result) {
        if(result.result === 'OK'){
          RedisService.setUserInfo(result.msg.username);
        }
        return res.json(200, result);
      }).catch(function (err) {
        return res.json(200, {result:'Failed',msg:err});
      });
  },

  /**
   * check wheather the username or email has existed.
   * @param req
   * @param res
   * @return 'exists' or 'not found'
   */
  checkExsit: function (req, res) {
    var propertyName = req.param('property'),
      result = {};
    result.result = 'Failed';
    if (null === propertyName || undefined === propertyName) {
      result.msg = 'empty not allowed';
      res.json(200, result);
    } else if ("username" === propertyName) {
      var query = {username: req.param('username') || ''};
    } else if ("email" === propertyName) {
      var query = {email: req.param('email') || ''}
    } else if("phone" === propertyName) {
      var query = {mobilePhoneNumber : req.param('phone') || ''}
    } else {
      result.msg = 'unknown property name';
      res.json(200, result);
    }

    User.checkExsit(query)
      .then(function (msg) {
        result.result = 'OK';
        result.msg = msg;
        return res.json(200, result);
      })
      .catch(function (err) {
        result.msg = err;
        return res.json(200, result);
      });
  },

  /**
   * send smscode to the specific phone
   * @param req
   * @param res
   */
  sendSmsCode: function (req, res) {
    var query = {
      phone: req.param('phone') || ""
    };
    var result = {};
    result.result = 'Failed';
    UserUtilService.sendSmsCode(query).then(function (data) {
      result.result = 'OK';
      result.msg = 'sms code already send';
      return res.json(200, result);
    }).catch(function (error) {
      result.msg = error;
      return res.json(200, result);
    });
  },

  /**
   * login
   * @param req
   * @param res
   */
  logIn: function (req, res) {
    var result = {};
    result.result = 'Failed';
    UserUtilService.logIn(req)
      .then(function (user) {
        result.result = 'OK';
        result.msg = user;
        return res.json(200, result);
      })
      .catch(function (err) {
        result.msg = err;
        return res.json(200, result);
      });
  },

  /**
   * update the user's nikename
   * @param req
   * @param res
   */
  updateNickname: function (req, res) {
    var nickname = req.body.nickname;
    if (undefined === nickname) res.json(401, {err: 'need nickname'});
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          User.update({username: username}, {nickname: nickname})
            .then(function (user) {
              RedisService.setUserInfo(user[0].username);
              result = {
                result: 'OK',
                msg: 'update nickname ok'
              };
              res.json(200, result);
            })
            .fail(function (err) {
              result = {
                result: 'Failed',
                msg: 'error'
              };
              res.json(200, result);
            })
        }
      });
  },

  /**
   * add a contact to the user
   * @param req
   * @param res
   */
  addContact: function (req, res) {
    var contactName = req.body.contact_name;
    var contactNumber = req.body.contact_number;
    var result = {};
    result.result = 'Failed';

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          User.findOne({username: username})
            .then(function (user) {
              if (user != undefined) {
                Contact.create({name: contactName, phone: contactNumber})
                  .then(function (contact) {
                    //user.contacts.add({id: contact.id});
                    user.contacts.add(contact.id);
                    user.save();
                    RedisService.setUserInfo(user.username);
                    result.result = 'OK';
                    result.msg = 'add contact ok';
                    res.json(200, result);
                  })
                  .fail(function (err) {
                    result.msg = 'create contact fail, maybe contact number exist';
                    res.json(200, result);
                  });
              } else {
                result.msg = 'not this user';
                res.json(200, result);
              }
            })
            .fail(function (err) {
              result.msg = 'add contact fail';
              res.json(200, result);
            });
        }
      });
  },

  /**
   * delete a contact of the user
   * @param req
   * @param res
   */
  deleteContact: function (req, res) {
    var contactNumber = req.body.contact_number;
    var result = {};
    result.result = 'Failed';

    UserUtilService.currentUser(req)
      .then(function (username) {
        //console.log('==========>current username:', username);
        if (null == username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          User.findOne({username: username})
            .then(function (user) {
              if (user != undefined) {
                Contact.findOne({phone: contactNumber})
                  .then(function (contact) {
                    //console.log('contact', contact);
                    if (contact != undefined) {
                      user.contacts.remove(contact.id);
                      user.save(function (err) {
                        if (err) {
                          result.msg = err;
                          res.json(200, result);
                        } else {
                          RedisService.setUserInfo(user.username);
                          contact.destroy();
                        }
                      });
                      result.result = 'OK';
                      result.msg = 'remove contact ok';
                      res.json(200, result);
                    } else {
                      result.msg = 'not this contact number';
                      res.json(200, result);
                    }
                  })
                  .fail(function (err) {
                    result.msg = 'find contact fail, check your number';
                    res.json(200, result);
                  });
              } else {
                result.msg = 'not this user';
                res.json(200, result);
              }
            })
            .fail(function (err) {
              result.msg = 'remove contact fail';
              res.json(200, result);
            });
        }
      });
  },

  /**
   * get the user with smartgates
   * @param req
   * @param res
   */
  getUserInfo: function (req, res) {
    var returnResult = {};
    returnResult.result = 'Failed';
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          User.findOne({username: username})
            .populate('contacts')
            .populate('smartgates')
            .then(function (user) {
              var result = {
                username: user.username,
                email: user.email,
                phone: user.mobilePhoneNumber,
                nickname: user.nickname,
                contacts: user.contacts
              };
              result.smartgates = [];

              Promise.map(user.smartgates, function (smartgate) {
                return new Promise(function (resolve, reject) {
                  RedisService.getLatestSmartGateData(smartgate.sn)
                    .then(function (data) {
                      result.smartgates.push(data);
                      resolve();
                    });
                });
              }).then(function () {
                returnResult.result = 'OK';
                returnResult.msg = result;
                res.json(200, returnResult);
              });
            })
            .fail(function (err) {
              returnResult.msg = 'error happen';
              res.json(200, returnResult);
            });
        }
      });
  },

  /**
   * get the user without the smartgate
   * @param req
   * @param res
   */
  getUser: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          User.findOne({username: username})
            .populate('contacts')
            .then(function (user) {
              var result = {
                username: user.username,
                phone: user.mobilePhoneNumber,
                nickname: user.nickname,
                contacts: user.contacts
              };
              res.json(200, result);
            })
            .fail(function (err) {
              res.json(401, {err: 'error happen'});
            });
        }

      }
    )
    ;
  },

  /**
   * send reset email
   * @param req
   * @param res
   */
  sendResetEmail: function (req, res) {
    var email = req.param('email') || '';
    UserUtilService.sendResetEmail(email)
      .then(function (info) {
        return res.json(200, info);
      })
      .catch(function (error) {
        return res.json(200, error);
      });
  }
  ,

  /**
   * sign with phone
   * @param req
   * @param res
   */
  signUpWithPhone: function (req, res) {
    var query = {
      username: req.body.username || req.body.phone,
      password: req.body.password || "",
      phone: req.body.phone || "",
      email: req.body.email || "",
      smsCode: req.body.sms_code || ""
    };

    var needEmail = ('' === query.email ? false : true) ;
    var verifyConditions = [];
    if(needEmail){
      verifyConditions = [
        {username:query.username},
        {mobilePhoneNumber:query.phone},
        {email:query.email}
      ]
    }else{
      verifyConditions = [
        {username:query.username},
        {mobilePhoneNumber:query.phone}
      ]
    }

    User.find({
      or: verifyConditions
    })
      .then(function (users) {
        if(undefined === users || users.length === 0){
          UserUtilService.signUpWithPhone(query)
            .then(function (user) {

              User.checkValid(user)
                .then(function (validUser) {
                  //create local user database
                  user.role = 'user';
                  return User.create(user)
                    .then(function (localUser) {
                      // update the redis-buffer
                      RedisService.setUserInfo(user.username);
                      var result = {
                        result: 'OK',
                        username: user.username,
                        phone: user.mobilePhoneNumber,
                        email: user.email,
                        session_token: user.sessionToken
                      };
                      return res.json(200, result);
                    });
                }, function (validError) {
                  result.msg = validError;
                  res.json(200, result);
                })
            })
            .fail(function (err) {
              var result = {
                result: 'Failed',
                msg: err
              };
              //401 means login error, android volley will think it to be some auth-failure, so we need to change it to 200
              return res.json(200, result);
            })
            .catch(function (error) {
              var result = {
                result: 'Failed',
                msg: error
              };
              return res.json(200, result);
            });
        }else{
          var result = {
            result : 'Failed',
            msg : '用户已被注册，请尝试换不同的用户名/手机号/邮箱'
          }
          res.json(200,result);
        }
      })


  }
  ,

  signUpWithThird: function (req, res) {
    var query = {
      username: req.body.username || "",
      password: req.body.password || "",
      phone: req.body.phone || "",
      email: req.body.email || "",
      type: req.body.type || "",
      open_id: req.body.open_id || "",
      access_token: req.body.access_token || ""
    };

    var result = {};
    result.result = 'Failed';

    var needEmail = ('' === query.email ? false : true) ;
    var verifyConditions = [];
    if(needEmail){
      verifyConditions = [
        {username:query.username},
        {mobilePhoneNumber:query.phone},
        {email:query.email}
      ]
    }else{
      verifyConditions = [
        {username:query.username},
        {mobilePhoneNumber:query.phone}
      ]
    }

    User.find({
      or: verifyConditions
    }).then(function (users) {
      if(undefined === users || users.length === 0){
        UserUtilService.signUpWithThird(query)
          .then(function (user) {

            User.checkValid(user)
              .then(function (validUser) {
                //create local user database
                user.role = 'user';
                User.create(user)
                  .then(function (user) {
                    RedisService.setUserInfo(user.username);
                    result.result = 'OK';
                    result.msg = user;
                    return res.json(200, result);
                  })
                  .fail(function (err) {
                    result.msg = err;
                    return res.json(200, result);
                  });
              }, function (validError) {
                result.msg = validError;
                res.json(200, result);
              })
          }).catch(function (error) {
            result.msg = error;
            return res.json(200, result);
          });
      }else{
        result.msg = '用户名/手机号/邮箱已经存在！';
        res.json(200,result);
      }
    })
  }
  ,

  logInWithThird: function (req, res) {
    var query = {
      type: req.body.type || "",
      open_id: req.body.open_id || ""
    };

    var login = function (user) {
      if (user === undefined) res.json({err: 'not this user'});

      var localUser = {
        sessionToken: sailsTokenAuth.generateToken({username: user.username, createdAt: new Date()})
      };

      return User.update({username: user.username}, localUser)
        .then(function (updateUser) {
          var result = {
            username: user.username,
            session_token: user.sessionToken
          };

          return res.json(200, result);
        });
    };

    if (query.type == 'qq') {
      User.findOne({qq_open_id: query.open_id})
        .then(function (user) {
          return login(user);
        });
    } else if (query.type == 'weixin') {
      User.findOne({weixin_open_id: query.open_id})
        .then(function (user) {
          return login(user);
        });
    } else if (query.type == 'sina') {
      User.findOne({sina_open_id: query.open_id})
        .then(function (user) {
          return login(user);
        });
    }

  }
  ,

  resetPassword: function (req, res) {

    UserUtilService.resetPassword(req)
      .then(function (info) {
        return res.json(200, info);
      })
      .catch(function (err) {
        return res.json(200, err);
      });
  }
  ,

  /**
   * change password
   * @param req
   * @param res
   */
  changePassword: function (req, res) {
    var query = {
      username: req.body.username || "",
      password: req.body.password || "",
      passwordNew: req.body.password_new || ""
    };
    var result = {};
    result.result = 'Failed';

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          UserUtilService.changePasswordByUserName(query)
            .then(function (data) {
              result.msg = 'can not changepassword';
              if (data.err != null) return res.json(200, result);

              return User.findOne({username: query.username})
                .then(function (user) {
                  User.validPassword(query.password, user, function (err, valid) {
                    if (err) {
                      result.msg = 'err password, forbidden';
                      return res.json(200, result);
                    }


                    if (!valid) {
                      result.msg = 'invalid username or password';
                      return res.json(200, result);
                    } else {
                      User.hashPassword(query.passwordNew, function (err, hash) {
                        if (err) {
                          result.msg = 'update password error';
                          res.json(200, result);
                        }
                        user.password = hash;
                        user.save(function (err) {
                          if (err) {
                            result.msg = err;
                            return res.json(200, result);
                          }
                          RedisService.setUserInfo(user.username);
                          result.result = 'OK';
                          result.msg = 'update password success';
                          return res.json(200, result);
                        });
                      });
                    }
                  });
                });
            })
            .fail(function (err) {
              result.msg = err;
              return res.json(200, result);
            })
            .catch(function (error) {
              result.msg = error;
              return res.json(200, result);
            });
        }
      });
  }
  ,

  /**
   * change password by phone
   * @param req
   * @param res
   */
  changePasswordByPhone: function (req, res) {
    var query = {
      phone: req.body.phone || "",
      password: req.body.password || "",
      smsCode: req.body.smsCode || ""
    };
    UserUtilService.changePasswordByPhone(query)
      .then(function (result) {
        res.json(200,result);
      })
  },

  /**
   * assign a smartgate to the user
   * @param req
   * @param res
   */
  addSmartGate: function (req, res) {
    var sn = req.body.sn;
    var returnResult = {};
    returnResult.result = 'Failed';
    if (sn === undefined || null === sn) {
      returnResult.msg = '请提供合法的主机SN';
      res.json(200, returnResult);
      return;
    }

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          SmartGate.findOne()
            .where({sn: sn})
            .then(function (smartgate) {
              if (undefined !== smartgate && smartgate.owner !== undefined && smartgate.owner !== 'unknown') {
                var result = {};
                result.result = 'Failed';
                result.msg = 'The smartgate has been assigned to some user, please delete it first.';
                res.json(200, result);
              } else if (undefined !== smartgate) {
                UserUtilService.assignSmartGate('add', smartgate.sn, username)
                  .then(function (result) {
                    res.json(200, result);
                  });
              } else {
                var result = {};
                result.result = 'Failed';
                result.msg = sails.config.errorcode.E504.detail;
                res.json(200, result);
              }
            })
            .catch(function (e) {
              sails.log.error('add smartgate error: ' + e.stack);
            });
        }
      });
  }
  ,

  /**
   * delete a smartgate from the user
   * @param req
   * @param res
   */
  rmSmartGate: function (req, res) {
    var sn = req.params['id'],
      returnResult = {};
    returnResult.result = 'Failed';
    if (sn === undefined || null === sn) {
      returnResult.msg = '主机SN号不合法';
      res.json(200, returnResult);
    }

    UserUtilService.currentUser(req)
      .then(function (username) {
        //console.log('==========>current username:', username);
        if (null == username) {
          res.json(200, sails.config.errorcode.E401.detail);
        } else {
          SmartGate.findOne()
            .where({sn: sn, owner: username})
            .then(function (smartgate) {
              if (undefined !== smartgate) {
                UserUtilService.assignSmartGate('delete', sn, username)
                  .then(function (result) {
                    //delete from the owner-admin
                    OwnerAdmin.find({owner: username})
                      .populate('smartgates')
                      .exec(function (err, ownerAdmins) {
                        if (ownerAdmins.length > 0) {
                          Promise.map(ownerAdmins, function (ownerAdmin) {
                            return new Promise(function (resolve, reject) {
                              ownerAdmin.smartgates.remove(sn);
                              ownerAdmin.save(function (err) {

                              })
                              resolve();
                            })
                          }).then(function () {
                            res.json(200, result);
                          })
                        } else {
                          res.json(200, result);
                        }
                      })
                  });
              } else {
                var result = {};
                result.result = 'Failed';
                result.msg = 'Can not find the smartgate or the smartgate does not belong to you.';
                res.json(200, result);
              }
            })
            .catch(function (e) {
              sails.log.error('delete smartgate error: ' + e.stack);
            });
        }
      });
  }
  ,

  /**
   * get the user's smartgates
   * @param req
   * @param res
   */
  getSmartGateByUser: function (req, res) {
    var returnResult = {};
    returnResult.result = 'Failed';
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(200, sails.config.errorcode.E401.detail);
        } else {
          RedisService.getSmartGateByUser(username)
            .then(function (result) {
              returnResult.result = 'OK';
              returnResult.msg = result;
              res.json(200, returnResult);
            }).catch(function (e) {
              returnResult.msg = e;
              res.json(200, returnResult);
              sails.log.error('get user\'s smartgates error: ' + e.stack);
            })
        }
      });
  },

  /**
   * get the user's smartgates
   * handle the superadmin situation
   * @param req
   * @param res
   */
  getSmartGateByWebUser: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(401, {err: '请先登录'});
        } else {
          RedisService.getUserInfo(username)
            .then(function (info) {
              if (info.role !== 'superadmin') {
                RedisService.getSmartGateByUser(username)
                  .then(function (result) {
                    res.json(200, result);
                  }).catch(function (e) {
                    sails.log.error('get user\'s smartgates error: ' + e.stack);
                  })
              } else {
                RedisService.getAllSmartGate()
                  .then(function (result) {
                    res.json(200, result);
                  }).catch(function (e) {
                    sails.log.error('get user\'s smartgates error: ' + e.stack);
                  })
              }
            });
        }
      });
  },

  /**
   * get the user's smartgates's sns
   * @param req
   * @param res
   */
  getSmartGateSnsByUser: function (req, res) {
    var returnResult = {};
    returnResult.result = 'Failed';
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(200,sails.config.errorcode.E401.detail);
        } else {
          RedisService.getSmartGateSnsByUser(username)
            .then(function (result) {
              returnResult.result = 'OK';
              returnResult.msg = result;
              res.json(200, returnResult);
            }).catch(function (e) {
              returnResult.msg = e.stack;
              res.json(200,returnResult);
              sails.log.error('get user\'s smartgates error: ' + e.stack);
            })
        }
      });
  },

  /**
   * set the user's installationId
   * @param req
   * @param res
   */
  setUserInstallationId: function (req, res) {
    var result = {};
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(401, {err: '请先登录'});
        } else {
          var installationId = req.body.installationId;
          if (null === installationId || undefined === installationId) {
            result.result = 'Failed';
            result.msg = '获取InstallationId失败!';
            res.json(200, result);
          }
          RedisService.setUserInstallationId(username, installationId)
            .then(function (message) {
              result.result = 'OK';
              if ('Failed' === message)
                result.msg = '服务器发生未知错误.'
              else
                result.msg = '';
              res.json(200, result);
            })
        }
      });
  },

  /**
   * get the owner's all admins
   * @param req
   * @param res
   */
  getAdmins: function (req, res) {
    var result = {};
    result.result = 'Failed';

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(401, {err: '请先登录'});
        } else {
          OwnerAdmin.find({owner: username})
            .then(function (ownerAdmins) {
              var admins = [];
              _.forEach(ownerAdmins, function (ownerAdmin) {
                admins.push(ownerAdmin.admin);
              })
              result.admins = admins;
              result.result = 'OK';
              res.json(200, result);
            })
            .fail(function (err) {
              res.json(200, result);
            })
        }
      });
  },

  /**
   * bind an admin to some owner
   * @param req
   * @param res
   */
  bindAdmin: function (req, res) {
    var result = {};
    result.result = 'Failed';

    /*var adminId = 'test1'
     if (null === adminId || undefined == adminId) {
     result.msg = '请提供管理员用户名';
     res.json(200, result);
     }
     User.findOne(adminId)
     .then(function (user) {
     //can not find the admin-user
     if (null === user || undefined === user) {
     result.msg = '管理员ID不合法';
     res.json(200, result);
     } else {
     OwnerAdmin.checkExist('shuyi', adminId)
     .then(function (isExist) {
     if (isExist) {      //has binded
     result.msg = '该用户已经是您的管理员';
     res.json(200, result);
     } else {
     OwnerAdmin.create({owner: 'shuyi', admin: adminId})
     .then(function (newOwnerAdmin) {
     if (null === newOwnerAdmin || undefined === newOwnerAdmin) {
     result.msg = '发生未知错误，请与管理员联系';
     } else {
     result.result = 'OK';
     result.msg = '指派管理员成功';
     }
     res.json(200, result);
     })
     }
     })
     }
     })*/

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(401, {err: '请先登录'});
        } else {
          var adminId = req.body.adminId;
          if (null === adminId || undefined == adminId) {
            result.msg = '请提供管理员用户名';
            res.json(200, result);
          }
          User.findOne(adminId)
            .then(function (user) {
              //can not find the admin-user
              if (null === user || undefined === user) {
                result.msg = '管理员ID不合法';
                res.json(200, result);
              } else {
                OwnerAdmin.checkExist(username, adminId)
                  .then(function (isExist) {
                    if (isExist) {      //has binded
                      result.msg = '该用户已经是您的管理员';
                      res.json(200, result);
                    } else {
                      OwnerAdmin.create({owner: username, admin: adminId})
                        .then(function (newOwnerAdmin) {
                          if (null === newOwnerAdmin || undefined === newOwnerAdmin) {
                            result.msg = '发生未知错误，请与管理员联系';
                          } else {
                            result.result = 'OK';
                            result.msg = '指派管理员成功';
                          }
                          res.json(200, result);
                        })
                    }
                  })
              }
            })
        }
      });
  },

  /**
   * unbind the owner-admin
   * @param req
   * @param res
   */
  unbindAdmin: function (req, res) {
    var result = {};
    result.result = 'Failed';

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(401, {err: '请先登录'});
        } else {
          var adminId = req.param('adminId');
          if (null === adminId || undefined == adminId) {
            result.msg = '请提供管理员用户名';
            res.json(200, result);
          }
          User.findOne(adminId)
            .then(function (user) {
              //can not find the admin-user
              if (null === user || undefined === user) {
                result.msg = '管理员ID不合法';
                res.json(200, result);
              } else {
                OwnerAdmin.checkExist(username, adminId)
                  .then(function (isExist) {
                    if (isExist) {      //has binded
                      OwnerAdmin.destroy()
                        .where({owner: username, admin: adminId})
                        .then(function (record) {
                          if (record.length > 0) {
                            result.result = 'OK';
                            result.msg = '解除管理员成功';
                            res.json(200, result);
                          } else {
                            result.result = 'Failed';
                            result.msg = '解除管理员失败';
                            res.json(200, result);
                          }
                        })
                    } else {
                      result.msg = '该管理员不属于您';
                      res.json(200, result);
                    }
                  })
              }
            })
        }
      });
  },

  /**
   * get the user's some admin's smartgates
   * @param req
   * @param res
   */
  getAdminSmartGates: function (req, res) {
    var result = {};
    result.result = 'Failed';

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(401, {err: '请先登录'});
        } else {
          var adminId = req.params['adminId'];
          if (null === adminId || undefined == adminId) {
            result.msg = '请提供管理员用户名';
            res.json(200, result);
          }
          OwnerAdmin.findOne({owner: username, admin: adminId})
            .populate('smartgates')
            .then(function (ownerAdmin) {
              if (null === ownerAdmin || undefined === ownerAdmin) {
                result.msg = '管理员ID不合法';
                res.json(200, result);
              }
              result.result = 'OK';
              result.msg = ownerAdmin.smartgates;
              res.json(200, result);
            })
        }
      });
  },

  /**
   * bind the smartgates to some admin
   * @param req
   * @param res
   */
  bindAdminSmartGates: function (req, res) {
    var result = {};
    result.result = 'Failed';

    /*var adminId = 'test1',
     username = 'shuyi';
     if (null === adminId || undefined == adminId) {
     result.msg = '请提供管理员用户名';
     res.json(200, result);
     }
     var smartGateSns = ['YBF001170000000234','YXF0002000000000000'];
     //var smartGateSns = [];
     if (null === smartGateSns || undefined === smartGateSns) {
     result.msg = '主机序列号不合法';
     res.json(200, result);
     //return;
     }
     OwnerAdmin.findOne({owner: username, admin: adminId})
     .populate('smartgates')
     .exec(function (err, ownerAdmin) {
     if (null === ownerAdmin || undefined === ownerAdmin) {
     result.msg = '管理员ID不合法';
     res.json(200, result);
     return;
     }

     if (ownerAdmin.smartgates.length > 0) {
     var oldSmartGateSns = [];
     Promise.map(ownerAdmin.smartgates, function (oldSmartGate) {
     var smartGateSn = oldSmartGate.sn;
     return new Promise(function (resolve, reject) {
     if (!_.includes(smartGateSns, smartGateSn)) {
     ownerAdmin.smartgates.remove(smartGateSn);      //only accept the primary-key
     }else{
     oldSmartGateSns.push(smartGateSn);
     }
     resolve();
     })
     }).then(function () {
     var newSmartGateSns = [];
     Promise.map(smartGateSns, function (newSmartGateSn) {
     return new Promise(function (resolve, reject) {
     SmartGate.findOne()
     .where({sn: newSmartGateSn, owner: username})
     .then(function (smartgate) {
     if (undefined !== smartgate) {
     newSmartGateSns.push(newSmartGateSn);
     }
     resolve();
     })
     })
     })
     .then(function () {
     newSmartGateSns = _.difference(newSmartGateSns,oldSmartGateSns);
     ownerAdmin.smartgates.add(newSmartGateSns);
     ownerAdmin.save(function (err) {
     console.log(err);
     if (err) {
     result.msg = '未知错误，请与管理员联系';
     } else {
     result.result = 'OK';
     result.msg = '分配主机成功！';
     }
     res.json(200, result);
     })
     })
     })
     } else {
     var newSmartGateSns = [];
     Promise.map(smartGateSns, function (newSmartGateSn) {
     return new Promise(function (resolve, reject) {
     SmartGate.findOne()
     .where({sn: newSmartGateSn, owner: username})
     .then(function (smartgate) {
     if (undefined !== smartgate) {
     newSmartGateSns.push(newSmartGateSn);
     }
     resolve();
     })
     })
     })
     .then(function () {
     ownerAdmin.smartgates.add(newSmartGateSns);
     ownerAdmin.save(function (err) {
     if (err) {
     result.msg = '未知错误，请与管理员联系';
     } else {
     result.result = 'OK';
     result.msg = '分配主机成功！';
     }
     res.json(200, result);
     })
     })
     }
     })*/


    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(401, {err: '请先登录'});
        } else {
          var adminId = req.params['adminId'];
          if (null === adminId || undefined == adminId) {
            result.msg = '请提供管理员用户名';
            res.json(200, result);
          }
          var smartGateSnsStr = req.body.smartGateSns;
          if (null === smartGateSnsStr || undefined === smartGateSnsStr) {
            result.msg = '主机序列号不合法';
            res.json(200, result);
            return;
          }

          var smartGateSns = smartGateSnsStr.split(',');
          OwnerAdmin.findOne({owner: username, admin: adminId})
            .populate('smartgates')
            .exec(function (err, ownerAdmin) {
              if (null === ownerAdmin || undefined === ownerAdmin) {
                result.msg = '管理员ID不合法';
                res.json(200, result);
                return;
              }

              if (ownerAdmin.smartgates.length > 0) {
                var oldSmartGateSns = [];
                Promise.map(ownerAdmin.smartgates, function (oldSmartGate) {
                  var smartGateSn = oldSmartGate.sn;
                  return new Promise(function (resolve, reject) {
                    if (!_.includes(smartGateSns, smartGateSn)) {
                      ownerAdmin.smartgates.remove(smartGateSn);      //only accept the primary-key
                    } else {
                      oldSmartGateSns.push(smartGateSn);
                    }
                    resolve();
                  })
                }).then(function () {
                  var newSmartGateSns = [];
                  Promise.map(smartGateSns, function (newSmartGateSn) {
                    return new Promise(function (resolve, reject) {
                      SmartGate.findOne()
                        .where({sn: newSmartGateSn, owner: username})
                        .then(function (smartgate) {
                          if (undefined !== smartgate) {
                            newSmartGateSns.push(newSmartGateSn);
                          }
                          resolve();
                        })
                    })
                  })
                    .then(function () {
                      newSmartGateSns = _.difference(newSmartGateSns, oldSmartGateSns);
                      ownerAdmin.smartgates.add(newSmartGateSns);
                      ownerAdmin.save(function (err) {
                        if (err) {
                          result.msg = '未知错误，请与管理员联系';
                        } else {
                          result.result = 'OK';
                          result.msg = '分配主机成功！';
                        }
                        res.json(200, result);
                      })
                    })
                })
              } else {
                var newSmartGateSns = [];
                Promise.map(smartGateSns, function (newSmartGateSn) {
                  return new Promise(function (resolve, reject) {
                    SmartGate.findOne()
                      .where({sn: newSmartGateSn, owner: username})
                      .then(function (smartgate) {
                        if (undefined !== smartgate) {
                          newSmartGateSns.push(newSmartGateSn);
                        }
                        resolve();
                      })
                  })
                })
                  .then(function () {
                    ownerAdmin.smartgates.add(newSmartGateSns);
                    ownerAdmin.save(function (err) {
                      if (err) {
                        result.msg = '未知错误，请与管理员联系';
                      } else {
                        result.result = 'OK';
                        result.msg = '分配主机成功！';
                      }
                      res.json(200, result);
                    })
                  })
              }
            })
        }
      });
  },

  /**
   * get the smartgates managed by the user
   * @param req
   * @param res
   */
  getManagedSmartGates: function (req, res) {
    var result = {};
    result.result = 'Failed';

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(401, {err: '请先登录'});
        } else {
          OwnerAdmin.find({admin: username})
            .populate('smartgates')
            .then(function (admins) {
              var smartGatesTotal = [];
              _.forEach(admins, function (admin) {
                smartGatesTotal = _.union(smartGatesTotal, admin.smartgates);
              });
              result.smartgates = [];
              Promise.map(smartGatesTotal, function (smartgate) {
                return new Promise(function (resolve, reject) {
                  RedisService.getLatestSmartGateData(smartgate.sn)
                    .then(function (data) {
                      result.smartgates.push(data);
                      resolve();
                    });
                });
              }).then(function () {
                result.result = 'OK';
                res.json(200, result);
              });
            })
            .fail(function (err) {
              res.json(401, {err: 'error happen'});
            });
        }
      });
  },

  test: function (req, res) {
    var array = ["sges"];
    Promise.map(array, function (value) {
      return new Promise(function (resolve, reject) {
        console.log(value);
      })
    }).then(function () {
      res.json(200, {msg: 'ok'});
    })
  },

  test1: function (req, res) {
    Device.destroy()
      .where({sn: 'camera1'})
      .then(function (record) {
        console.log(record);
        result.result = 'OK',
          result.msg = 'Delete OK.';
        res.json(200, result)
      })

  },

  test2: function (req, res) {
    var username = 'shuyi',
      sn = 'YBF001170000000234';
    var result = {
      result: 'Failed'
    }
    OwnerAdmin.find({owner: username})
      .populate('smartgates')
      .exec(function (err, ownerAdmins) {
        if (ownerAdmins.length > 0) {
          Promise.map(ownerAdmins, function (ownerAdmin) {
            return new Promise(function (resolve, reject) {
              ownerAdmin.smartgates.remove(sn);
              ownerAdmin.save(function (err) {

              })
              resolve();
            })
          }).then(function () {
            result.result = 'OK';
            res.json(200, result);
            /*ownerAdmins.save(function (err) {
             if (err) {
             result.result = 'Failed';
             result.msg = '与管理员解除绑定失败';
             }
             res.json(200, result);
             })*/
          })
        } else {
          result.result = 'OK';
          res.json(200, result);
        }
      })
  }

}
;

