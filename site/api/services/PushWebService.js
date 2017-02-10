/**
 * Created by shuyi on 16-1-26.
 */
var _ = require('lodash');
var io = require('socket.io').listen(3000);

var userSockets = {};

module.exports = {
  init: function () {
    initPushSocketServer();
  },

  /**
   * push message to special user
   * Web client
   * @param username
   * @param msg
   */
  pushSpecialUserWeb: function (username, msg) {
    if (userSockets.hasOwnProperty(username)) {
      _.forEach(userSockets[username], function (socketPair) {
        _.values(socketPair)[0].emit('push_to_' + username, {data: msg});
      })
    }
  }
}

/**
 * init the socket.io server
 */
function initPushSocketServer() {
  io.sockets.on('connection', function (socket) {
    socket.on('login', function (obj) {
      var username = obj.username;
      console.log('login ' + username);
      socket.name = username;
      //not included. add
      if (!userSockets.hasOwnProperty(username)) {
        userSockets[username] = {};
      }
      //the same user login in several web clients
      if (!userSockets[username].hasOwnProperty(socket.id)) {
        userSockets[username][socket.id] = socket;
      }
    });

    socket.on('disconnect', function () {
      //delete the client
      if(undefined != socket.name && userSockets.hasOwnProperty(socket.name)){
        if (userSockets[socket.name].hasOwnProperty(socket.id)) {
          delete userSockets[socket.name][socket.id];
          console.log('delete ' + socket.name + ' ' + socket.id);
        }
      }
    })
  });
}