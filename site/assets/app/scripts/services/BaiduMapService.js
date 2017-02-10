/**
 * Created by xieyiming on 15-3-11.
 */


angular.module('service.baiduMap', [])

    .service("BaiduMapService", ["$q", '$timeout', "$http", "DevService", "$rootScope",
        function ($q, $timeout, $http, DevService, $rootScope) {
            var self = this
            var _mapDomId = "dashmap";
           /* var _initLat = 116.404;
            var _initLng = 39.915;*/
            var _initLat = 110.910;
            var _initLng = 38.010;

            var CoorByIpURL = "/api/location/coor"
            var AddressByCoorURL = "/api/location/address"
            var map;

            self.setup = function (smartgates) {
                // wait the baiduMap cdn to init itself
                $timeout(function () {
                    map = new BMap.Map(_mapDomId);//创建map实例 设置最小缩放级别
                    /*var mapStyle={  style : "mapbox" }
                    map.setMapStyle(mapStyle);*/
                    map.setMinZoom(5);
                    var point = new BMap.Point(_initLat, _initLng);//创建点坐标
                    map.centerAndZoom(point, 6);// 初始化地图，设置中心点坐标和地图级别
                    map.enableScrollWheelZoom(true);//// 设置了最大级别和最小级别之后，滚动的范围也受制于最大与最小，根据实际使用情况进行设置
                    map.enableKeyboard(); // 启用键盘操作。
                    map.addControl(new BMap.NavigationControl());
                    map.addControl(new BMap.ScaleControl());
                    map.addControl(new BMap.OverviewMapControl());
                    /*添加地图类型控件*/
                    map.addControl(new BMap.MapTypeControl({mapTypes: [BMAP_NORMAL_MAP,BMAP_SATELLITE_MAP ]}));
                    /*map.addControl(new BMap.MapTypeControl());*/

                    map.enableScrollWheelZoom(true);
                    // 覆盖区域图层测试
                   /* map.addTileLayer(new BMap.PanoramaCoverageLayer());*/

                    var stCtrl = new BMap.PanoramaControl(); //构造全景控件
                    stCtrl.setOffset(new BMap.Size(20, 35));
                    map.addControl(stCtrl);//添加全景控件

                    self.Covering(smartgates);//点集合

                }, 1000);
            }

            self.Covering = function(smartgates){
                var markers = [];
                _.forEach(smartgates, function (el) {

                    var marker = new BMap.Marker(new BMap.Point(el.smartgate.lng, el.smartgate.lat));  // 创建标注
                    var content = '<div style="text-align: center;"><h5 style="font-weight: bold;color: #34495c;font-size: 16px;">' + el.smartgate.dev_name + '</h5><h6 style="color: #34495c;font-size: 14px;">' + el.smartgate.sn + '</h6></div>';
                    markers.push(marker);
                    addClickHandler(content, marker, el.smartgate);
                })

                var Icon = new BMap.Icon("http://api.map.baidu.com/img/markers.png");

                new BMapLib.MarkerClusterer(map, {markers: markers,icon: Icon});

                var opts = {
                    width: 80,     // 信息窗口宽度
                    height: 80,     // 信息窗口高度
                    //enableMessage:true,//设置允许信息窗发送短息
                    offset: new BMap.Size(0, -20)    //设置文本偏移量
                }

                function addClickHandler(content, marker, smartgate) {
                    marker.addEventListener("click", function (e) {
                            DevService.getDevInfoByUid(smartgate.sn).then(function (data) {
                                $rootScope.$broadcast("ui:update:curDev", data);
                            });
                            openInfo(content, e)
                        }
                    );
                }

                function openInfo(content, e) {
                    var p = e.target;
                    var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat);
                    var infoWindow = new BMap.InfoWindow(content, opts);  // 创建信息窗口对象
                    map.openInfoWindow(infoWindow, point); //开启信息窗口
                }
            }


            self.setView = function (name, sn, lat, lng) {

                if (lat != "" && lng != "") {
                    var new_point = new BMap.Point(lng, lat); //初始化地图中心点
                    map.centerAndZoom(new_point, 25); //设置中心点坐标和地图级别

                    var opts = {
                        width: 80,     // 信息窗口宽度
                        height: 80,     // 信息窗口高度
                        offset: new BMap.Size(0, -20)    //设置文本偏移量
                    }

                   /* var sContent = '<div class="well"><h5 class="text-success">' + name + '</h5><h6>' + sn + '</h6></div>';*/
                    var sContent = '<div style="text-align: center;"><h5 style="font-weight: bold;color: #34495c;font-size: 16px;">' + name + '</h5><h6 style="color: #34495c;font-size: 14px;">' + sn + '</h6></div>';
                    var infoWindow = new BMap.InfoWindow(sContent, opts);  // 创建信息窗口对象
                    map.openInfoWindow(infoWindow, new_point);
                }

            }

            self.provinceCenter = function (lat, lng, zoom) {
                if (lat != "" && lng != "" && zoom != "") {
                    var new_point = new BMap.Point(lng, lat); //初始化地图中心点
                    map.centerAndZoom(new_point, zoom); //设置中心点坐标和地图级别
                }
            }


            self.getAddressByCoor = function (lat, lng) {
                var query = AddressByCoorURL + "?" + "lat=" + lat + "&lng=" + lng

                return $http.get(query)
            }

            self.getCoorByIp = function (ip) {
                //todo: check is real ip
                var query = URL1 + "?" + "ak=" + AKStr + "&ip=" + ip + "&coor=bd09ll"

                $http.get(query).then(function (data) {
                    console.log("getCorrByIp: ", data.data)
                })

            }

            self.fillSettingInfo = function (dev_uuid) {
                // /api/device/info/?dev_uuid=rs110-201410180207&components=null
                var query = "/api/device/info/?dev_uuid=" + dev_uuid + "&components=null"
                var deferred = $q.defer()

//        setTimeout(function(){

                $http.get(query).then(function (data) {
                    var devinfo = data.data
                    console.log("fillSettingInfo get: ", devinfo)

                    // simu data
                    devinfo.common.location = {}
                    devinfo.common.remote_ip = "171.216.73.21"
                    devinfo.common.location.lat = 30.679942690127
                    devinfo.common.location.lng = 104.06792337347
                    devinfo.common.location.addrStr = "服务器给的地址(todo)"
                    devinfo.common.location.devname = "devname"

                    var geoInfo = {
                        lat: devinfo.common.location.lat,
                        lng: devinfo.common.location.lng,
                        addrStr: devinfo.common.location.addrStr,
                        devname: devinfo.common.location.devname
                    }

                    return deferred.resolve(geoInfo);
                })
//        },2000)

                return deferred.promise;
            }

            self.getCurCoor = function (dev_uuid) {
                //todo make it real
                console.log("## getCurCoor: ", dev_uuid)

                var deferred = $q.defer();

                setTimeout(function () {
                    return deferred.resolve({
                        lat: 30.67994285,
                        lng: 104.0679234,
                        devname: "devname"
                    });
                })


                return deferred.promise;
            }

        }])
