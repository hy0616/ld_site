var url = require("url");
var request = require('request');
var Q = require('q');

var leancloud_config = sails.config.leancloud_config;

var rootPath = 'https://leancloud.cn/1.1';


module.exports = {

  send: function (phone) {

    var options = {
      url: leancloud_config.api_rootpath + '/requestSmsCode',
      method: 'POST',
      headers: {
        'X-LC-Id': leancloud_config.app_id,
        'X-LC-Key': leancloud_config.app_key
      },
      body: {
        'mobilePhoneNumber': phone
      },
      json: true
    };

    return _doRequest(options);
  },

  sendTemplate: function (phone, template) {

    var options = {
      url: leancloud_config.api_rootpath + '/requestSmsCode',
      method: 'POST',
      headers: {
        'X-LC-Id': leancloud_config.app_id,
        'X-LC-Key': leancloud_config.app_key
      },
      body: {
        'mobilePhoneNumber': phone,
        'template': template
      },
      json: true
    };

    return _doRequest(options);
  },

  verifyCode: function (phone, code) {

    var options = {
      url: leancloud_config.api_rootpath + '/verifySmsCode/' + code + '?mobilePhoneNumber=' + phone,
      //url: rootPath + '/verifySmsCode/' + code,
      method: 'POST',
      headers: {
        'X-LC-Id': leancloud_config.app_id,
        'X-LC-Key': leancloud_config.app_key
      },
      body: {
        'mobilePhoneNumber': phone
      },
      json: true
    };

    return _doRequest(options);
  }

};

function _doRequest(options) {

  var deferred = Q.defer();

  request(options, function (err, res, body) {

    //options.timeout = 60000;

    if (!err && res.statusCode == 200) {
      deferred.resolve(body);
    } else {
      //console.log(res);
      if (_.isUndefined(res)) {
        throw (_T('Error.Common.NetWork.Timeout'));
      }

      deferred.reject(body);
    }
  });

  return deferred.promise;
}
