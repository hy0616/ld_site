/** * Created by xieyiming on 15-1-2. */(function(){  'use strict'  angular.module('theme.leafletMap', [    "leaflet-directive"  ])    .controller('MapController', ['$scope', 'MapService', 'leafletData', '$location', '$timeout', 'DashboardMapService',      function ($scope, MapService, leafletData, $location, $timeout, DashboardMapService) {        var self = $scope;        self.layers = {          baselayers: DashboardMapService.getBaselayer(),          overlays: {}        }        self.center = DashboardMapService.getCenter()        self.defaults = {          attributionControl: false,          scrollWheelZoom: false,        }      }])})();