
(function(){
  'use strict'
  angular
    .module('theme.pages-controllers', [])
    .controller('SignupPageController', ['$scope', '$global', function ($scope, $global) {
      $global.set('fullscreen', true);

      $scope.$on('$destroy', function () {
        $global.set('fullscreen', false);
      });
    }])
    .directive('scrollToBottom', function () {
      return {
        restrict: 'A',
        scope: {
          model: '=scrollToBottom'
        },
        link: function (scope, element, attr) {
          scope.$watch('model', function (n, o) {
            if (n != o) {
              element[0].scrollTop = element[0].scrollHeight;
            }
          });
        }
      };
    })

})();



