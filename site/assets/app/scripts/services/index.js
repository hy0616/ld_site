/**
 * Created by xieyiming on 15-1-9.
 */

angular.module('app.service.index', [
  'service.dev',
  'service.highchart',
  'service.util',
  'service.translate',
  'service.auth',
  'service.notify',
//  'service.flot',
  'service.baiduMap',
  'service.map',
  'service.pushWeb',
])



angular.module('lodash', [])
  .factory('lodash', function(){
      return window._;
  })

