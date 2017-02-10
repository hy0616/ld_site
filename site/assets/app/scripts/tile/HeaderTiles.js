/**
 * Created by xieyiming on 15-1-10.
 */

(function(){
  'use strict'

  angular.module('theme.headerTile',  [

  ])

    .controller('HeaderTileController', ['$scope', 'DevService', "$global","$interval", function ($scope, DevService, $global, $interval) {
      var self = $scope;

      self.$on("update:curChn", function(){
        console.log("update:curChn updating")
        self.curChn = DevService.curChn

        var timer = $interval(function(){
  //        console.log("$interval get curChn:", self.curChn)
          self.curChn = DevService.curChn
        }, 1000, 50); // 600 ms, 10 times
      })

  //    console.log("$global.get headerBarHidden: ", $global.get("headerBarHidden"))

      self.network = {
        header: {
          cssClass: "fa fa-random",
          text: "传感器参数"
        },

        content: [
          {key: '用途', val: '检测温度'},
          {key: '范围', val: '-20C - 50C'},
          {key: 'ieeee', val: '56c13393-6aaf-49ed-8850-5b77e879264e'}
        ]
      }

      self.network2 = {
        header: {
          cssClass: "fa fa-rocket",
          text: "Server"
        },

        content: [
          {key: 'ip  ', val: '192.168.25.83'},
          {key: '网关', val: '192.168.25.254'},
          {key: '掩码', val: '192.168.25.83'},
          {key: 'dns1', val: '192.168.25.83'},
          {key: 'dns2', val: '192.168.25.83'},
          {key: 'dns3', val: '192.168.25.83'},
          {key: 'dns4', val: '192.168.25.83'},
          {key: 'dns5', val: '192.168.25.83'},
          {key: 'dns6', val: '192.168.25.83'}
        ]
      }

      self.network3 = {
        header: {
          cssClass: "fa fa-wrench",
          text: "Ftp"
        },

        content: [
          {key: 'ip', val: '192.168.25.83'},
          {key: '网关', val: '192.168.25.254'},
          {key: '掩码', val: '192.168.25.83'},
          {key: 'dns1', val: '192.168.25.83'},
          {key: 'dns2', val: '192.168.25.83'},
          {key: 'dns3', val: '192.168.25.83'},
          {key: 'dns4', val: '192.168.25.83'},
          {key: 'dns5', val: '192.168.25.83'},
          {key: 'dns6', val: '192.168.25.83'}
        ]
      }

    }])


})();






