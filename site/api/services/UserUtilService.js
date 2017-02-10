/**
 * Created by xieyiming on 15-3-11.
 */


var Q = require('q'),
  AV = require('avoscloud-sdk').AV,
  Promise = require('bluebird'),
  is = require("is_js"),
  s = require("underscore.string"),
  datetime = require('./datetime');

var leancloud_config = sails.config.leancloud_config;

AV.initialize(leancloud_config.app_id, leancloud_config.app_key);      //yuncloud@yunyangdata.com


var parseMongoError = function (error) {

  // Error is like this:
  // {
  //   "error": "E_UNKNOWN",
  //   "status": 500,
  //   "summary": "Encountered an unexpected error",
  //   "raw": {
  //     "name": "MongoError",
  //     "code": 11000,
  //     "err": "insertDocument :: caused by :: 11000 E11000 duplicate key error index: cmyydev.user.$username_1  dup key: { : \"e1234234\" }"
  //   }
  var errObj = is.object(error) ? error.toJSON() : {};
  var errMsgs = [];

  var makeErrorReadable = {
    "E_VALIDATION": function () {
      //sails.log.debug("handle E_VALIDATION: ", errObj.invalidAttributes);
      _.forEach(_.keys(errObj.invalidAttributes), function (errAttr) {
        errMsgs.push(errAttr + " is required.");
      });
      sails.log.debug("errMsgs: ", errMsgs);

      return {err: errMsgs};
    },

    "E_UNKNOWN": function () {
      //sails.log.debug("E_UNKNOWN handler: ", errObj);
      if (!_.has(errObj.raw) && 11000 != errObj.raw.code) {
        return {err: "database unknow error"};
      }
      //insertDocument :: caused by :: 11000 E11000 duplicate key error index: cmyydev.user.$email_1  dup key: { : "fef@qq.com" }
      sails.log.debug("get 11000 error: ", errObj.raw.err);
      errMsgs.push(s.trim(errObj.raw.err.split("dup key: { :")[1], " }\"") + " is already token.");

      sails.log.debug("return errMsg: ", errMsgs);
      return {err: errMsgs};
    }
  };

  return makeErrorReadable[errObj.error]();
};

module.exports = {
  currentUser: function (req) {
    return new Promise(function (resolve, reject) {
      if (req.headers && req.headers.authorization) {

        var parts = req.headers.authorization.split(' ');
        if (parts.length == 2) {
          var scheme = parts[0],
            credentials = parts[1];

          if (/^Bearer$/i.test(scheme)) {
            token = credentials;
          }

          sailsTokenAuth.verifyToken(token, function (err, token) {
            if (err)
              resolve(null);
            else
              resolve(token.username);
          });
        }
        ;
      } else {
        resolve(null);
      }
    });
  },

  signUpWithThird: function (query) {
    var deferred = Q.defer();

    if (query.type != 'qq' && query.type != 'weixin' && query.type != 'sina') {
      deferred.reject({err: 'type not support'});
    } else {
      // TODO: the access_token real verify need add
      //

      //return after verify
      var localUser = {
        username: query.username,
        password: query.password,
        sessionToken: sailsTokenAuth.generateToken({username: query.username, createdAt: new Date()})
      };

      localUser[query.type + '_open_id'] = query.open_id;
    }

    deferred.resolve(localUser);

    return deferred.promise;
  },

  resetPassword: function (req) {
    var token = req.body.token || "";
    var ps1 = req.body.ps1 || "";
    var ps2 = req.body.ps2 || "";

    var result = {};
    result.result = 'Failed';

    return new Promise(function (resolve, reject) {
      if (is.empty(token)) {
        result.msg = '不合法的token';
        reject(result);
      }
      if (is.empty(ps1) || is.empty(ps2)) {
        result.msg = '密码为空';
        reject(result);
      }
      if (ps1 != ps2) {
        result.msg = '两次密码不一致';
        reject(result);
      }

      sailsTokenAuth.decode(token).then(function (info) {
        User.findOne({email: info.email}).then(function (user) {
          User.hashPassword(ps1, function (err, hash) {
            if (err) {
              result.msg = '更新密码出错';
              reject(result);
            }

            user.password = hash;
            user.save(function (err) {
              if (err) {
                result.msg = err;
                reject(result);
              }
              //return res.json(200, user);
              RedisService.setUserInfo(user.username);

              var localUser = {
                username: user.username,
                phone: user.mobilePhoneNumber,
                email: user.email,
                sessionToken: sailsTokenAuth.generateToken({username: user.username, createdAt: new Date()})
              };

              result.result = 'OK';
              result.msg = localUser;
              resolve(result);
            });
          });

        });
      });

    });
  },

  /**
   * send reset email
   * @param email
   * @return {bluebird|exports|module.exports}
   */
  sendResetEmail: function (email) {

    var result = {};
    result.result = 'Failed';

    return new Promise(function (resolve, reject) {

      var query = {email: email};
      User.checkExsit(query)
        .then(function (msg) {
          if (msg === 'exist') {
            sailsTokenAuth.encode({email: email}).then(function (token) {
              var href = 'href='+'"http://127.0.0.1/reset?token='+token+'"';
              //var href = 'href=' + '"http://platform.linkdotter.com/reset?token=' + token + '"';

              Emailer.send({
                to: email,
                subject: "联点数据农业云平台密码重置邮件",
                messageHtml: '<h2>我们是联点数据农业云平台账号管理团队：</h2><br><a ' + href + ' style="padding:10px 20px;border-radius:5px;color:white;background-color:rgb(99, 171, 240)" >请点我修改重置密码</a>'

              }, function (err, ret) {
                if (err) {
                  result.msg = err;
                  reject(result);
                } else {
                  result.result = 'OK';
                  result.msg = '发送邮件成功!'
                  resolve(result);
                }
              });
            });
          } else {
            result.msg = '该邮箱地址未注册!';
            resolve(result);
          }
        })
    });
  },

  signUp: function (req) {

    var query = {
      username: req.body.username || "",
      password: req.body.password || "",
      email: req.body.email || "",
      mobilePhoneNumber: req.body.phone || "",
      sessionToken: sailsTokenAuth.generateToken({username: req.body.username, createdAt: new Date()}),
      session_token: sailsTokenAuth.generateToken({username: req.body.username, createdAt: new Date()})
    };

    var result = {};
    result.result = 'Failed';

    var needEmail = ('' === query.email ? false : true);
    var verifyConditions = [];
    if (needEmail) {
      verifyConditions = [
        {username: query.username},
        {mobilePhoneNumber: query.mobilePhoneNumber},
        {email: query.email}
      ]
    } else {
      verifyConditions = [
        {username: query.username},
        {mobilePhoneNumber: query.mobilePhoneNumber}
      ]
    }

    return User.find({
      or: verifyConditions
    })
      .then(function (users) {
        if (undefined === users || users.length === 0) {
          return new Promise(function (resolve, reject) {
            User.checkValid(query)
              .then(function (user) {
                user.role = 'user';         //default to be 'user'
                User.create(user)
                  .then(function (newUser) {
                    result.result = 'OK';
                    result.msg = newUser;
                    resolve(result);
                  })
                ;
              })
              .catch(function (err) {
                //sails.log.debug("parseMongoError err: ",  parseMongoError(err));
                //sails.log.debug("err: ", is.json(err));
                is.json(err) ? reject(parseMongoError(err)) : reject({err: err});
              });
          });
        } else {
          result.msg = '用户已被注册，请尝试换不同的用户名/手机号/邮箱';
          return new Promise(function (resolve, reject) {
            resolve(result);
          })
        }
      })
  },

  logIn: function (req) {
    var query = {
      username: req.body.username || "",
      password: req.body.password || "",
      email: req.body.email || "",
      installationId: req.body.installationId
    };

    var login_query = _.omit(_.pick(query, "username", "email"), is.empty);

    return new Promise(function (resolve, reject) {
      if (is.all.empty(login_query)) return reject({message: "username is empty."});
      if (is.not.alphaNumeric(login_query.username)) return reject({message: "username format error."});

      User.findOne(login_query).then(function (user) {
        if (is.undefined(user)) return reject({message: "user not found."});

        User.validPassword(query.password, user, function (err, valid) {
          if (err) return reject({message: "password not match"});
          user.session_token = user.sessionToken;
          user.phone = user.mobilePhoneNumber;
          sails.log.debug("----------> debug user: ", user);

          is.truthy(valid) ? resolve(user) : reject({message: "password not match."});
        });
      });
    });

  },

  /**
   * send smscode
   * @param query
   * @return {promise}
   */
  sendSmsCode: function (query) {
    var deferred = Q.defer();
    console.log("sendSmsCode to: ", query.phone);

    AV.Cloud.requestSmsCode(query.phone).then(function () {
      return deferred.resolve({status: "smsCode already send"});
    }, function (err) {

      return deferred.reject(err);
    });

    return deferred.promise;
  },

  /**
   * signup with phone
   * @param query
   * @return {promise}
   */
  signUpWithPhone: function (query) {
    var deferred = Q.defer();

    smsService.verifyCode(query.phone, query.smsCode).then(function () {
      //验证成功
      var localUser = {
        username: query.username,
        password: query.password,
        mobilePhoneNumber: query.phone,
        mobilePhoneVerified: true,
        email: query.email,
        sessionToken: sailsTokenAuth.generateToken({username: query.username, createdAt: new Date()}),
        session_token: sailsTokenAuth.generateToken({username: query.username, createdAt: new Date()})
      };
      return deferred.resolve(localUser);

    }, function (err) {
      //验证失败
      return deferred.reject("验证码错误");
    });

    return deferred.promise;
  },

  changePasswordByUserName: function (query) {
    var deferred = Q.defer();

    deferred.resolve({err: null, msg: "updatePassword done"});
    /*
     var user = AV.User.logIn(query.username, query.password, {
     success: function(user) {
     user.updatePassword(query.password, query.passwordNew,{
     success: function(){
     return deferred.resolve({err: null, msg: "updatePassword done"})
     },
     error: function(err){
     return deferred.reject({err: err});
     }
     });
     },

     error: function (user, error) {
     return deferred.reject(error);
     }

     })
     */
    return deferred.promise;
  },

  changePasswordByPhone: function (query) {
    var result = {};
    result.result = 'Failed';

    return new Promise(function (resolve, reject) {
      User.findOne()
        .where({mobilePhoneNumber: query.phone})
        .then(function (user) {
          if (null === user || undefined === user) {
            result.msg = '该手机号未绑定任何用户';
            resolve(result);
          } else {
            smsService.verifyCode(query.phone, query.smsCode).then(function () {
              //验证成功
              User.hashPassword(query.password, function (err, hash) {
                if (err) {
                  result.msg = '更新密码错误';
                  resolve(result);
                }
                user.password = hash;
                user.save(function (err) {
                  if (err) {
                    result.msg = err;
                    resolve(result);
                  }
                  RedisService.setUserInfo(user.username);

                  var localUser = {
                    username: user.username,
                    phone: query.phone,
                    email: user.email,
                    sessionToken: sailsTokenAuth.generateToken({username: user.username, createdAt: new Date()})
                  };

                  result.result = 'OK';
                  result.msg = localUser;
                  resolve(result);
                });
              });
            }, function (err) {
              //验证失败
              result.msg = '验证码错误';
              resolve(result);
            });
          }
        })
    })
  },

  /**
   * assign a smartgate to a user or delete a smartgate from a user
   * @param action
   * @param smartGateSn
   * @param username
   * @returns {bluebird|exports|module.exports}
   */
  assignSmartGate: function (action, smartGateSn, username) {
    return new Promise(function (resolve, reject) {
      var req_data = {};
      req_data.meta = {
        type: 'user_assign_smartgate',
        time: datetime.getLocalString(),
        version: ''
      };
      req_data.data = {
        action: action,
        smartgate_sn: smartGateSn,
        owner: username
      }

      //result is 'OK' or 'Failed'
      HttpClient.createHttpClient(req_data).then(function (result) {
        resolve(result);
      });
    });
  }
};

