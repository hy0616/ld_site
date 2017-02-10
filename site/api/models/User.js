var bcrypt = require('bcrypt'),
  Promise = require('bluebird'),
  is = require('is_js');


//NOTICE: the atrr CAN NOT name like_this , it will cause the mongo error parse error
module.exports = {
  tableName: 'user',
  attributes: {
    username: {
      type: 'string',
      unique: true,
      primaryKey: true,
      index: true
    },

    nickname: {
      type: 'string'
    },

    //when login will create this seesionToken, include username and create date
    sessionToken: {
      type: 'string'
    },

    email: {
      type: 'string',
      unique: true
    },

    emailVerified: {
      type: 'boolean',
      defaultsTo: false
    },

    emailVerifyToken: {
      type: 'string'
    },

    mobilePhoneNumber: {
      type: 'string',
      //required: true,
      unique: true
    },

    mobilePhoneVerified: {
      type: 'boolean',
      defaultsTo: false
    },

    role: {
      model: 'role'
    },

    password: {
      type: "string"
    },

    resetPasswordToken: {
      type: 'string'
    },

    messages: {
      collection: 'message',
      via: 'owner'
    },

    devcurdatas: {
      collection: 'devcurdata',
      via: "users"
    },

    smartgates: {
      collection: 'smartgate',
      via: 'owner'
    },

    contacts: {
      collection: 'contact',
      via: 'owner'
    },

    weixin_open_id: {
      type: 'string',
      unique: true
    },

    qq_open_id: {
      type: 'string',
      unique: true
    },

    sina_open_id: {
      type: 'string',
      unique: true
    },

    toJSON: function () {
      var obj = this.toObject();

      delete obj.password;
      //delete obj.sessionToken;
      delete obj.emailVerifyToken;
      delete obj.resetPasswordToken;
      delete obj.updatedAt;
      delete obj.createdAt;

      return obj;
    }

  },

  beforeCreate: function (user, next) {

    bcrypt.genSalt(10, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  },

  resetPassword: function (user, next) {
    next();
  },

  /**
   * check the username or email has existed
   * @param query
   * @return {bluebird|exports|module.exports}
   */
  checkExsit: function (query) {
    query = _.omit(query, is.empty);

    return new Promise(function (resolve, reject) {
      User.findOne(query)
        .then(function (user) {
          is.not.undefined(user) ? resolve("exist") : resolve("not found");
        })
        .catch(function (err) {
          reject("db error");
        });
    });
  },

  checkValid: function (user) {
    // login or signUp

    return new Promise(function (resolve, reject) {
      var errs = [];
      if (user.username.length < 5) {
        errs.push("用户名至少5位.");
      }
      if (is.not.alphaNumeric(user.username)) {
        errs.push("用户名必须为字母数字组成.");
      }

      //if( is.not.email(user.email) ) { errs.push("email format is not correct."); }

      is.empty(errs) ? resolve(user) : reject(errs);
    });
  },

  validPassword: function (password, user, cb) {
    bcrypt.compare(password, user.password, function (err, match) {
      if (err) cb(err);

      if (match) {
        cb(null, true);
      } else {
        cb(err);
      }
    });
  },

  hashPassword: function (password, cb) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) cb(err);
      bcrypt.hash(password, salt, function (err, hash) {
        if (err) return cb(err);
        cb(null, hash);
      });
    });
  },


  getAll: function () {
    return User.find()
      .populate("role")
      .then(function (models) {
        return [models];
      });
  },

  getOne: function (id) {
    return User.findOne(id)
      .then(function (model) {
        return [model];
      });
  }


};
