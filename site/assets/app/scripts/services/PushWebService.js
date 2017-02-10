/**
 * Created by shuyi on 16-1-26.
 */

angular.module('service.pushWeb', [])
    .service('PushWebService', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {
        var self = this;
        self.socket = null,
            self.username = null;

        self.init = function (username) {
            self.username = username;
            //self.socket = io.connect('http://127.0.0.1:3000');
            self.socket = io.connect('ws://platform.linkdotter.com:3000');
            // notify the server that a new user login
            self.socket.emit('login', {username: username});
            //subscribe the message
            self.socket.on('push_to_' + username, function (data) {
                $rootScope.$broadcast('event_push', data)
            })
        }

        self.UpdateData = function () {

            var deferred = $q.defer();
            var query_str = "api/users/alarmevents" + "?" + "read_state=unread"
            $http.get(query_str).then(function (data) {
                return deferred.resolve(data);
            })
            return deferred.promise;
        }
    }]);