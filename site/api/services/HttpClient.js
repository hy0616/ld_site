/**
 * Created by shuyi on 15-8-5.
 */
var http = require('http');
var Promise = require('bluebird');

var options = {
  hostname: sails.config.server_config.receiver_server_ip,
  port: sails.config.server_config.receiver_server_port,
  path: null,
  method: 'POST',
  headers: {'Content-Type': 'application/json'}
};

module.exports = {
  /**
   * connect to the http server and send data
   * @param req_data data to send
   * @returns {bluebird|exports|module.exports}
   */
  createHttpClient: function (req_data) {
    return new Promise(function (resolve, reject) {
      var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        var buffers = "";
        res.on('data', function (chunk) {
          buffers += chunk;
        }).on('end', function () {
          resolve(JSON.parse(buffers));
        });
      });
      req.write(JSON.stringify(req_data));
      req.end();
    });
  }


 /* createHttpClient: function (req_data) {
    return new Promise(function (resolve, reject) {
      var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        var buffers = [];
        var size = 0;
        res.on('data', function (chunk) {
          size += chunk.length;
          buffers.push(chunk);
        }).on('end', function () {
          var buffer = Buffer.concat(buffers, size);
          buffers = null;
          resolve(JSON.parse(buffer));
        });
      });
      req.write(JSON.stringify(req_data));
      req.end();
    });
  }*/
};
