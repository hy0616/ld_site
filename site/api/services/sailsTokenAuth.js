var jwt = require('jsonwebtoken');
var Promise = require('bluebird');

module.exports = {

  //todo: change this func name, it's so silly
  generateToken: function(payload) {
    sails.log.info("user jwtsecret: ", sails.config.localconf.jwtSecret);
    var token = jwt.sign(payload, sails.config.localconf.jwtSecret || "monitorCloud");
    return token;
  },

  verifyToken: function(token, verified) {
    return jwt.verify(token, sails.config.localconf.jwtSecret || "monitorCloud", {}, verified);
  },


  encode: function(content) {
    return new Promise(function(resolve, reject){
      var token = jwt.sign(content, sails.config.localconf.jwtSecret || "monitorCloud");
      resolve(token);
    });
  },

  decode: function(token) {
    return new Promise(function(resolve, reject){
      jwt.verify(token, sails.config.localconf.jwtSecret || "monitorCloud", {}, function(err, ret){
        if(err) reject(err);
        resolve(ret);
      });

    });
  }

};




