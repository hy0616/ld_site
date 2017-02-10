var util = require('util');
var _ = require('lodash'),
  net = require('net');
var uuid = require('node-uuid');
var EventEmitter = require('events').EventEmitter;

var WebCmd = function () {
  EventEmitter.call(this);
};

util.inherits(WebCmd, EventEmitter);
module.exports = WebCmd;


var PORT = sails.config.server_config.receiver_tcp_server_port;
var HOST = sails.config.server_config.receiver_server_ip;


var WEB_DEV_TYPE = 'web';
var WEB_CCP_TOKEN = 'ccp_token-web-20150201';

var generateHeader = function () {
  return {version: 1, subversion: 0, sync: "imccim"}
}

var formRemoteControl = function (ccp_token, cmd) {
  var remote_control = {};
  var parsedCmd = parseToString(cmd);
  parsedCmd = JSON.parse(parsedCmd);
  remote_control.header = generateHeader();
  remote_control.body = _.assign({ccp_token: ccp_token}, parsedCmd);
  remote_control.header.bodylen = JSON.stringify(remote_control.body).length;

  return remote_control;
};

WebCmd.prototype.doCmd = function (ccp_token, smartgateSn, devCmd, rt_info) {
  var self = this;

  try {
    var client = net.connect(PORT, HOST, function () {
      var cmd = {};

      var remote_control = formRemoteControl(ccp_token, devCmd);
      cmd.header = generateHeader();
      cmd.body = {
        dev_uuid: uuid.v4(),
        dev_type: WEB_DEV_TYPE,
        ccp_token: WEB_CCP_TOKEN,
        cmd: "remote_control",
        remote_smartgate_sn: smartgateSn,
        remote_control: remote_control,
        rt_info: rt_info
      };

      //console.log("do remote_control cmd: \n" + JSON.stringify(cmd, null, 2));
      cmd.header.bodylen = JSON.stringify(cmd.body).length;

      client.write(JSON.stringify(cmd));
      self.emit('connect');
    });

    client.on('data', function (data) {
      try {
        var jsonData = JSON.parse(data);
        //console.log('==========================>1,', jsonData.type, ', keep_connection=', jsonData.keep_connection);
        if (jsonData.type == 'response') {
          if (jsonData.keep_connection === undefined || jsonData.keep_connection == false)
            client.end();
          self.emit('data', data);
        } else if (jsonData.type == 'data') {
          self.emit('data', data);
        }
      } catch (e) {
        client.end();
        self.emit('end');
      }
    });

    client.on('end', function () {
      console.log('disconnect from server');
      self.emit('end');
      client = null;
    });

    client.on('error', function () {
      console.log('connect error');
      self.emit('error');
    });
  } catch (e) {
    console.log('--->' + e.stack);
    self.emit('error', e);
  }
};

/**
 * parse the oldValue to String
 * @param oldValue
 * @return {*}
 */
function parseToString(oldValue) {
  var returnValue;
  if (typeof(oldValue) === 'object') {
    returnValue = JSON.stringify(oldValue);
  } else {
    returnValue = oldValue;
  }
  return returnValue;
}




