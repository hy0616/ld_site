/**
 * Created by shuyi on 16-1-15.
 */
var url = require("url");
var request = require('request');
var Q = require('q');

var leancloud_config = sails.config.leancloud_config;


module.exports = {
  /**
   * push some message to special user by the user's installationId
   * Mobile
   * @param installationId
   * @param channels. Array
   * @param msg
   * @return {*}
   */
  pushSpecialUser: function (installationId, channels, title, msg) {
    var options = {
      url: leancloud_config.api_rootpath + '/push',
      method: 'POST',
      headers: {
        'X-LC-Id': leancloud_config.app_id,
        'X-LC-Key': leancloud_config.app_key
      },
      body: {
        'where': {
          installationId: installationId
        },
        'data':{
          action:'com.itserv.shed.NEW_EVENT',
          alert: msg,
          title: title
        },
        channels: channels
      },
      json:true
    };

    return _doRequest(options);
  },

  /**
   * push some message to special web user by the user's username
   * 'web_channel_' + username  is the channel
   * the appid and appkey will be stored in the client-js. Exposed, not safe.
   * @param username
   * @param title
   * @param msg
   * @return {*}
   */
  pushSpecialUserWeb: function (username, title, msg) {
    var channels = ['web_channel_' + username];
    var options = {
      url: leancloud_config.api_rootpath + '/push',
      method: 'POST',
      headers: {
        'X-LC-Id': leancloud_config.app_id,
        'X-LC-Key': leancloud_config.app_key
      },
      body: {
        'data':{
          alert: msg,
          title: title
        },
        channels: channels
      },
      json:true
    };

    //return _doRequest(JSON.stringify(options));
    return _doRequest(options);
  },

  /**
   * push offline message to special user
   * @param username
   * @param installationId
   * @param channels
   * @param title
   * @param msg
   * @return {*}
   */
  pushSpecialUserCmd: function (installationId, channels, cmd, content) {
    var options = {
      url: leancloud_config.api_rootpath + '/push',
      method: 'POST',
      headers: {
        'X-LC-Id': leancloud_config.app_id,
        'X-LC-Key': leancloud_config.app_key
      },
      body: {
        'where': {
          installationId: installationId
        },
        'data':{
          action:'com.itserv.shed.NEW_CMD',
          content: content,
          cmd:cmd,
          title:'New Command From Server.'
        },
        channels: channels
      },
      json:true
    };

    return _doRequest(options);
  }
}

/**
 * using http to request the leancloud
 * @param options
 * @return {*}
 * @private
 */
function _doRequest(options){
  return new Promise(function (resolve, reject) {
    request(options, function (err, res, body) {
      //options.timeout = 60000;

      if (!err && res.statusCode == 200) {
        resolve(body);
      } else {
        if (_.isUndefined(res)) {
          //throw (_T('Error.Common.NetWork.Timeout'));
        }

        reject(body);
      }
    });
  })
}
