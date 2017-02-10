/**
 * Created by xieyiming on 15-1-13.
 */


angular.module('service.map', [

])

  .service("DashboardMapService", ["$q", "DevModel", "$http", "leafletEvents", 'MapService', '$rootScope','BaiduMapService',
    function ($q, DevModel, $http, leafletEvents, MapService, $rootScope,BaiduMapService) {
      var self = this;


      var proviceLocation = {
//        "四川": {
//          lat: 30.637912028341123,
//          lng: 104.0185546875
//        }
        "安徽": { lat: 31.859252, lng: 117.216005},
        "福建": { lat: 26.050118, lng: 117.984943},
        "甘肃": { lat: 38.103267, lng: 102.457625},
        "广东": { lat: 23.408004, lng: 113.394818},

        "广西": { lat: 23.552255, lng: 108.924274},
        "黑龙": { lat: 47.356592, lng: 128.047414},
        "内蒙": {lat: 43.468238, lng: 114.415868},
        "宁夏": {lat: 37.321323, lng: 106.155481},
        "西藏": {lat: 31.367315, lng: 89.137982},
        "新疆": {lat: 42.127001, lng: 85.614899},

        "贵州": {lat: 26.902826, lng: 106.734996},
        "海南": {lat: 19.180501, lng: 109.733755},
        "河北": {lat: 38.61384, lng: 115.661434},
        "河南": {lat: 34.157184, lng: 113.486804},
        "湖北": {lat: 31.209316, lng: 112.410562},
        "湖南": {lat: 27.695864, lng: 111.720664},
        "江苏": {lat: 33.013797, lng: 119.368489},
        "江西": {lat: 27.757258, lng: 115.676082},
        "吉林": {lat: 43.678846, lng: 126.262876},
        "辽宁": {lat: 41.6216, lng: 122.753592},
        "青海": {lat: 35.499761, lng: 96.202544},
        "山东": {lat: 36.09929, lng: 118.527663},
        "山西": {lat: 37.866566, lng: 112.515496},
        "陕西": {lat: 35.860026, lng: 109.503789},
        "四川": {lat: 30.367481, lng: 102.89916},
        "云南": {lat: 24.864213, lng: 101.592952},
        "浙江": {lat: 29.159494, lng: 119.957202},
        "北京": {lat: 39.929986, lng: 116.395645},
        "上海": {lat: 31.249162, lng: 121.487899},
        "天津": {lat: 39.14393, lng: 117.210813},
        "重庆": {lat: 29.544606, lng: 106.530635}

      };

      self.provinceCenter = function (name) {
        var target = proviceLocation[_.first(name, 2).join("")];

          if(!target){
              BaiduMapService.provinceCenter(proviceLocation["北京"].lat, proviceLocation["北京"].lng, 5);
          }else{

              BaiduMapService.provinceCenter(target.lat, target.lng, 5);
          }

      };

      self.cityCenter = function (lat, lng) {
//        console.log("cityCenter:", lat, lng)
          BaiduMapService.provinceCenter(lat, lng, 8);
      };

      self.districtCenter = function (lat, lng) {
          BaiduMapService.provinceCenter(lat, lng, 8);
      }

      // http://localhost:1337/api/devgroup/device_list?group_name=rs&common=location&components=null
      var _center = {
        lat: 34.95799531086792,//26.82407078047018,
        lng: 107.22656249999999,//114.345703125,
        zoom: 4
      };

      var _markers = {

      };

      var _baselayers = {
        cloudmade: {
          name: '监测地图',
          type: 'xyz',
          url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        }
      };

      var _overlays = {

      };

      var _layers = {
        baselayers: {
          cloudmade: {
            name: '监测地图',
            type: 'xyz',
            url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
        },
        attributionControl:false,

        overlays: {

        }
      };

      var _events = {
        markers: {
          enable: leafletEvents.getAvailableMarkerEvents()
        }
      };

      self.getDefaults = function(){
        return {
          attributionControl: false,
          zoomControl: true
        };
      };

      self.getCenter = function () {
        return _center;
      };

      self.getBaselayer = function () {
        return _baselayers;
      };

      self.getOverlayer = function () {
        var deferred = $q.defer();

        var group_url = "/api/geogroups/provinces";

        $http.get(group_url).then(function (data) {
          var overlayer = {};
          _.each(_.pluck(data.data, "name"), function (group) {
            overlayer[group] = {
              name: group,
              type: 'markercluster',
              visible: true
            };
          });
          return deferred.resolve(overlayer);
        });

        return deferred.promise;
      };

      self.getMarkers = function () {
        return _markers;
      };

      self.getLayers = function () {
        var deferred = $q.defer();

        var group_url = "/api/geogroups/provinces";

        $http.get(group_url).then(function (data) {
//          var mapLayers = {}
          _.each(_.pluck(data.data, "name"), function (group) {
            _layers.overlays[group] = {
              name: group,
              type: 'markercluster',
              visible: true
            };
          });
          return deferred.resolve(_layers);
        });

        return deferred.promise;
      };

      self.getEvents = function () {
        return _events;
      };

      self.focusOnMarker = function (name, sn, lat, lng) {
        var uuid_body = sn.split("smartgate-")[1];

        console.log(">>> >>> focusOnMarker: " + sn + " lat:" + lat + " lng: " + lng +"uuid_body"+ uuid_body);

        BaiduMapService.setView(lat, lng).then(function () {
            var theMarker = _.find(_markers, function (el) {
            return el.sn_body == uuid_body;
          });

          $rootScope.$broadcast("ui.marker.focus", true);
          console.info("## show the fuck message: ", theMarker);

          try {
            _.forEach(_markers, function (el) {
              el.focus = false;
            });

            _markers[theMarker.address].focus = true;
            _markers[theMarker.address].message = '<h5 class="text-success">' + theMarker.layer + '</h5><h6>' + sn + '</h6>';
//            _markers[theMarker.address].message = "hello"

//            console.info("after _markers: ", _markers)
            console.info("## show the fuck message: done!!");

          } catch (err) {
            console.error("err: ", err);
          }
//          console.error("focusOnMarker after: ", _markers)
        });

      };

      self.addMarker = function (group, marker) {

        var group = group; // for debug

        if (!_.has(_layers.overlays, group)) {
          _layers.overlays[group] = {
            name: group,
            type: "markercluster",
            visible: true
          };
        }

        _markers[marker.address] = {
          layer: group,
          lat: marker.lat,
          lng: marker.lng,

          dev_uuid_prefix: marker.dev_uuid_prefix,
          dev_uuid_body: marker.dev_uuid_body,
          address: marker.address,
          focus: false,

          icon: {
            iconUrl: 'assets/img/fanqie.png',
//            shadowUrl: 'assets/img/leaf-shadow.png',
            iconSize:     [32, 32],
            shadowSize:   [0, 0],
            iconAnchor:   [17, 10],
            shadowAnchor: [0, 0]
          }
        };
      };

    }])

  .service("MapService", ["$q", "DevModel", function ($q, DevModel) {
    var self = this;
    var markers = {};
    var mapLayers = {};
    //todo: watch markers to send to db

    self.addMarker = function (newmarker) {
      var deferred = $q.defer();

      setTimeout(function () {
        //todo: check the newmarker.name exsit?
        markers[newmarker.name] = {};
        markers[newmarker.name].layer = newmarker.group;
        markers[newmarker.name].lat = newmarker.lat;
        markers[newmarker.name].lng = newmarker.lng;

        return deferred.resolve();
      });
//      return deferred.reject();
      return deferred.promise;
    };

    self.getMarkers = function () {
      var deferred = $q.defer();

      //todo: two mode: map or sidebar

//      return false;

      if (_.isEmpty(markers)) {
        DevModel.getGrounInfo().then(function (data) {
          console.log("get Markers mode 2");
          _(data).each(function (group) {
            mapLayers[group.dev_group] = {
              name: group.dev_group,
              type: 'markercluster',
              visible: true
            };
            _(group.children).each(function (device) {
              markers[device.dev_alias] = {
                layer: group.dev_group,
                message: device.dev_alias,
                lat: device.lat,
                lng: device.lng
              };
            }); // group.each end
          }); // data.each end

          console.info("========== Mr Right ====: ", markers);
          return deferred.resolve(markers);
        });
      } else {
        setTimeout(function () {
          console.info("========== Mr Right2 ====: ", markers);
          return deferred.resolve(markers);
        });
      }

      return deferred.promise;
    };

    self.getGrounInfo = function () {
//    self.getMarkers = function () {
      var deferred = $q.defer();

      return deferred.promise;
    };

    self.getLayers = function () {
      var deferred = $q.defer();

      DevModel.getGrounInfo().then(function (data) {
        _(data).each(function (group) {
          mapLayers[group.dev_group] = {
            name: group.dev_group,
            type: 'markercluster',
            visible: true
          };
          _(group.children).each(function (device) {
            markers[device.dev_alias] = {
              layer: group.dev_group,
              message: device.dev_alias,
              lat: device.lat,
              lng: device.lng
            };
          });// group.each end
        });// data.each end

        console.log("right version layers: ", mapLayers);
        return deferred.resolve(mapLayers);
      });

      return deferred.promise;
    };

  }]);



