'use strict';


describe("simple test", function(){
    it("should equal to 3", function(){
        expect(3).toBe(3);
    });
});

describe('Controller: Dashboard', function () {
  var DashboardCtrl;
  var $rootscope;
  var $scope;

  beforeEach(module('theme.dashboard'));
  beforeEach(inject(function (_$rootScope_, $controller) {
      $rootscope = _$rootScope_;
      $scope = _$rootScope_.$new();
      DashboardCtrl = $controller("DashboardController", {
          $scope: $scope
      });
//      DashboardCtrl = $controller("DashboardController");
  }));

//  // Initialize the controller and a mock scope
//  beforeEach(inject(function ($controller, $rootScope) {
//    scope = $rootScope.$new();
//    MainCtrl = $controller('MainCtrl', {
//      $scope: scope
//    });
//  }));

    describe("test", function(){
        it("should have a message", function(){
//       expect(DashboardCtrl.message).toBe("hello you");
            expect($scope.fortest).toBe("fortest");
        });

    });

});
