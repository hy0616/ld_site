/**
 * Created by xieyiming on 15-2-27.
 */



angular.module('service.notify', ['lodash'])

  .service('NotifyService', ['toastr', function(toastr) {
    var self = this;

    var checkOldIE = function(){
      var isOldIE = false;

      console.info("todo(notifyService): check old IE");
      return isOldIE;
    };

//    self.notify = function(option) {
//      var defaults = {message: 'i am notify', classes: "alert-success"}
//
//      _.extend(defaults, option);
////      console.log("defaults: ", defaults);
//
//      if(checkOldIE()){
//        alert(defaults.message);
//      } else {
//        notify.config({duration: 3000});
//        notify(defaults);
//      }
//    };

    self.error = function(message){
      toastr.error(message, "Error")
    };
    self.info = function(message){
      toastr.info(message)
    };
    self.success = function(message){
      toastr.success(message)
    };

  }]);

