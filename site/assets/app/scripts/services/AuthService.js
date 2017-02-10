/**
 * Created by xieyiming on 15-2-27.
 */

angular.module('service.auth', [
  'LocalStorageModule'
])

//  .config(function($httpProvider){
//    $httpProvider.interceptors.push("AuthInterceptor");
//  })

  .config(function(localStorageServiceProvider){
    localStorageServiceProvider
      .setPrefix('yy')
      .setStorageType('localStorage');
    //    localStorageServiceProvider.setStorageType('sessionStorage');
  })


  .service("AuthService", ["$q", '$rootScope', 'localStorageService', '$http', '$location', function ($q, $rootScope, localStorageService, $http, $location) {
    var self = this;
    var _tokenVerified = false;
    var _username = "";
    var _token = "";

    self.checkLogin = function(){
      console.info("--> checkLogin");
    };

    self.loginRequired = function(){
      console.info("++++++ loginRequired +++++++ ");
      localStorageService.set("loginRequired", "test-token");

      var token = localStorageService.get("token");
      var username = localStorageService.get("username");

      if( null == token || null == username ) {
        window.location = "/login";
      } else {
        _username = username;
        _token = token;
      }

    };

    self.getUsername = function(){
      return _username;
    };

    self.isAdmin = function(){
      return true;
    };

    self.getToken = function() {
      return localStorageService.get('auth_token');
    };

    self.getCurrentUser = function(){
      return localStorageService.get('user');
    };

    self.getgetCurrentUserName = function(){
      var user = localStorageService.get('user');

      if(!_.isNull(user)){
        return localStorageService.get('user').username;
      }
      return '';
    };

    self.isLogin = function() {
      if(_.isNull(localStorageService.get('user'))){
        return false;
      } else {
        return true;
      }
    };

    self.login = function(userinfo) {
//      localStorageService.set("user", userinfo.user);
//      localStorageService.set("auth_token", userinfo.token);
//      var deferred = $q.defer();

      return $http.post('/api/auth/login', userinfo)
        .success(function(response) {
          localStorageService.set("user", response.user);
          localStorageService.set("auth_token", response.token);
//          deferred.resolve();
        });

    };

    self.logOut = function() {
      localStorageService.remove('username');
      localStorageService.remove('token');
      window.location = "/";
    };

    self.signup = function(userinfo) {
//        localStorageService.remove('auth_token');
      console.log("##  AuthService register", userinfo);

      return $http.post('/api/auth/signup', userinfo)
        .success(function(response){
          localStorageService.set("user", response.user);
          localStorageService.set("auth_token", response.token);
        });
    };


  }]);
