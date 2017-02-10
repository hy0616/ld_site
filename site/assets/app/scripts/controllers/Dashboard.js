(function () {
    'use strict';

    angular.module('page.dashboard', [])

        .controller("DevListController", ['$scope', 'DevService', '$global', '$rootScope',
            function ($scope, DevService, $global, $rootScope) {
                var self = $scope;

                self.curGroupMode = 'geo';

                self.setGroupMode = function (mode) {

                    $rootScope.$broadcast("ui.group.changed", mode);

                    self.curGroupMode = mode;
                };

                //get total 大棚count
                DevService.getTotalInfo().then(function (data) {
                    self.totalCnt = data.smartgate_total_num;
                    self.onlineCnt = data.online_smartgate_num;

                });

                //get personal 大棚count
                DevService.getPersonalInfo().then(function (data) {
                    self.personal_totalCnt = data.smartgate_total_num;
                    self.personal_onlineCnt = data.smartgate_online_num;

                });

            }])

        .controller("DashCurController", ["$scope", "DevService", "$rootScope", "timeConversion",
            function ($scope, DevService, $rootScope,timeConversion) {
                var self = $scope;
                self.refreshing = false;
                self.$on("ui:update:curDev", function (ev, da) {
                    if (da === true) {
                        self.curGreenHouse = DevService.curGreenHouse;

                    } else {
                        self.curGreenHouse = da;
                        DevService.curDevuuid = da.smartgate.sn;
                    }
                    console.log("curGreenHouse", self.curGreenHouse);

                    self.falsh_data = true;
                    /*更新时间格式*/
                    self.plant_time = self.curGreenHouse.smartgate.plant_time.substr(0, 4) + "-" +
                        self.curGreenHouse.smartgate.plant_time.substr(4, 2) + "-" +
                        self.curGreenHouse.smartgate.plant_time.substr(6, 2);

                    /*种植时间格式*/
                    self.harvest_time = self.curGreenHouse.smartgate.harvest_time.substr(0, 4) + "-" +
                        self.curGreenHouse.smartgate.harvest_time.substr(4, 2) + "-" +
                        self.curGreenHouse.smartgate.harvest_time.substr(6, 2);

                    //转换日期格式-最后更新时间

                    _.forEach(self.curGreenHouse.components, function(val){
                       val.server_time = timeConversion.conversion(val.server_time);
                    })

                    /*传感器排序*/
                    self.sort_curGreenHouse = _.sortBy(self.curGreenHouse.components, function (item) {
                        return item.dev_type
                    })

                });

                self.refresh = function () {

                    self.refreshing = true;

                    DevService.getDevInfoByUid(DevService.curDevuuid).then(function (data) {
                        DevService.curGreenHouse = data;
                        $rootScope.$broadcast("ui:update:curDev", true);
                        self.curDevInfo = data;
                        self.refreshing = false;
                    });
                };

                self.testMoment = {
                    //        time:"2015-06-01 07:11:00"
                    time: "2014-10-29T23:31:23Z"
                };

                self.showPid = true;
                self.hidden_pid = function () {
                    self.showPid = !self.showPid;
                }

            }])

        .controller("GeoGroupController", ['$scope', '$rootScope', '$global', 'DevService', 'MapService', '$interval', 'DashboardMapService', 'BaiduMapService',
            function ($scope, $rootScope, $global, DevService, MapService, $interval, DashboardMapService, BaiduMapService) {
                var self = $scope;

                $global.set('rightbarCollapsed', true);

                self.curDistrictLocation = {};

                DevService.getProvinceList().then(function (data) {
                    //        console.info("=======> GeoGroupController geoGroups: ", data)
                    self.geoGroups = data;
                });

                self.showGeoGroupDetail = function (group, isopen) {

                    if (isopen) {

                        DevService.getCityList({province: group}).then(function (data) {
                            self.geoCities = data;

                            self.curGroupIndex = _.findIndex(self.geoGroups, function (el) {
                                return el.name == group;
                            });

                            self.geoGroups[self.curGroupIndex]["geoCities"] = self.geoCities;

                        });
                    } else {
                        //          console.info("---> back to province center", group)
                        DashboardMapService.provinceCenter(group);
                    }

                }; // showGeoGroupDetail

                self.showGeoGityDetail = function (province, city, isopen) {
                    self.curCity = city;

                    if (isopen) {

                        self.curGroupIndex = _.findIndex(self.geoGroups, function (el) {
                            return el.name == province;
                        });

                        self.devinfoLoadding = true;

                        DevService.getDistrictList({province: province, city: city}).then(function (data) {
                            self.geoDistricts = data;

                            self.curCityIndex = _.findIndex(self.geoGroups[self.curGroupIndex]["geoCities"], function (el) {
                                return el.name == city;
                            });

                            self.devinfoLoadding = false;

                            self.geoGroups[self.curGroupIndex]["geoCities"][self.curCityIndex]["geoDistricts"] = self.geoDistricts;

                        });

                    } else {
                        DashboardMapService.cityCenter(self.geoGroups[self.curGroupIndex]["geoCities"][self.curCityIndex].lat, self.geoGroups[self.curGroupIndex]["geoCities"][self.curCityIndex].lng);
                        //          DashboardMapService.cityCenter(self.curCityLocation[province + city].lat, self.curCityLocation[province + city].lng);
                    }

                }; // showGeoGityDetail

                self.showGeoDistrictDetail = function (province, city, district, isopen) {

                    self.curDistrict = district;

                    if (isopen) {

                        self.curGroupIndex = _.findIndex(self.geoGroups, function (el) {
                            return el.name == province;
                        });
                        self.curCityIndex = _.findIndex(self.geoGroups[self.curGroupIndex]["geoCities"], function (el) {
                            return el.name == city;
                        });


                        self.devinfoLoaddingFlag = true;
                        DevService.getSmartGateByDistrict({
                            province: province,
                            city: city,
                            district: district
                        }).then(function (data) {

                            self.curDistrictIndex = _.findIndex(self.geoGroups[self.curGroupIndex]["geoCities"][self.curCityIndex]["geoDistricts"], function (el) {
                                return el.name == district;
                            });

                            self.geoGroups[self.curGroupIndex]["geoCities"][self.curCityIndex]["geoDistricts"][self.curDistrictIndex]["devinfo"] = data;

                            self.devinfoLoaddingFlag = false;
                            var temp = self.geoGroups[self.curGroupIndex]["geoCities"][self.curCityIndex]["geoDistricts"][self.curDistrictIndex];

                            self.curDistrictLocation[province + city + district] = {
                                lat: temp.lat,
                                lng: temp.lng
                            };

                        });

                    } else {
                        //          console.log("go back to city center: ", self.curCityLocation)
                        DashboardMapService.districtCenter(self.curDistrictLocation[province + city + district].lat, self.curDistrictLocation[province + city + district].lng);
                    }

                }; // showGeoDistrictDetail

                self.showDevDetail = function ($event, name, sn, lat, lng) {

                    self.curDev = sn;
                    //DashboardMapService.focusOnMarker(name, sn, lat, lng);
                    BaiduMapService.setView(name, sn, lat, lng);

                    DevService.curDevuuid = sn;

                    DevService.getDevInfoByUid(sn).then(function (data) {

                        DevService.curGreenHouse = data;

                        $rootScope.$broadcast("ui:update:curDev", true);

                        self.curDevInfo = data;
                    });

                }; // showDevDetail

                self.showChnDetail = function ($event, dev_uuid, component_id) {

                    $event.stopPropagation();
                    $global.set('headerBarHidden', false);
                    self.curIdStr = dev_uuid + component_id;

                    if ((DevService.curDevuuid == dev_uuid) && (DevService.curComponentId == component_id)) {
                        return false;
                    } else {
                        DevService.cancleHeaderTimers();
                    }

                    DevService.curDevuuid = dev_uuid;
                    DevService.curComponentId = component_id;

                    $rootScope.$broadcast("ui:dashboard:chnChanged", true);

                    $rootScope.$broadcast("update:chninfo:all", {dev_uuid: dev_uuid, component_id: component_id});
                    $rootScope.$broadcast("update:chninfo:brief", {dev_uuid: dev_uuid, component_id: component_id});
                    DevService.showDetailTimer = $interval(function () {
                        $rootScope.$broadcast("update:chninfo:brief", {dev_uuid: dev_uuid, component_id: component_id});
                    }, 1000);
                }; // showChnDetail
            }])

        .controller("CustomGroupController", ['$scope', '$rootScope', '$global', 'DevService', 'MapService', '$interval', 'DashboardMapService',
            function ($scope, $rootScope, $global, DevService, MapService, $interval, DashboardMapService) {
                var self = $scope;
                var showDetailTimer = null;

                self.Select = {
                    province: [],
                    city: [],
                    district: [],
                    plant: []
                };

                self.CurrentSelect = {
                    province: '',
                    city: '',
                    district: ''
                }

                self.availableProvinces = [];
                self.availableCitys = [];
                self.availableDistricts = [];
                self.availablePlants = [];

                self.items = [
                    'The first choice!',
                    'And another choice for you.',
                    'but wait! A third!'
                ];

                self.status = {
                    isopen: false
                };

                DevService.getProvinceList().then(function (data) {
                    console.info(">>> >>> getProvinceList:", _.pluck(data, "name"));
                    self.availableProvinces = _.pluck(data, "name");
                });

                self.provinceSelect = function (province) {
                    console.log("provinceOnselect $item: ", province);
                    self.CurrentSelect.province = province;

                    DevService.getCityList({province: province}).then(function (data) {
                        self.availableCitys = _.pluck(data, "name");
                    });
                };

                self.cityOnSelect = function (city) {
                    //        console.log("cityOnselect city: ", city)
                    self.CurrentSelect.city = city;

                    DevService.getDistrictList({province: self.CurrentSelect.province, city: self.CurrentSelect.city})
                        .then(function (data) {
                            self.availableDistricts = _.pluck(data, "name");
                        })
                };

                self.districtOnSelect = function (district) {
                    self.CurrentSelect.district = district;

                    if (_.isEmpty(self.availablePlants)) {
                        DevService.getPlantList().then(function (data) {
                            self.availablePlants = _.pluck(data, "name");
                        });
                    }
                }

                self.plantOnSelect = function ($item) {
                    console.log("plantOnSelect $item: ", $item);
                };

                self.searchCustom = function () {
                    console.log("ssearchCustom: ", self.Select);

                    if (_.isEmpty(self.Select.province) || _.isEmpty(self.Select.city) || _.isEmpty(self.Select.district) || _.isEmpty(self.Select.plant)) {
                        alert("搜索条件不完整");
                        return false;
                    }


                };

                self.images = [
                    {
                        'url': 'assets/img/demo5.png',
                        'thumbUrl': 'http://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Waynejunction0810b.JPG/180px-Waynejunction0810b.JPG',
                        //          'caption': 'This image has dimensions 2272x1704 and the img element is scaled to fit inside the window. The left and right arrow keys are binded for navigation. The escape key for closing the modal is binded by AngularUI Bootstrap.'
                    },

                    {
                        'url': 'assets/img/demo2.png',
                        'thumbUrl': 'http://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Waynejunction0810b.JPG/180px-Waynejunction0810b.JPG',
                        //          'caption': 'This image has dimensions 2272x1704 and the img element is scaled to fit inside the window. The left and right arrow keys are binded for navigation. The escape key for closing the modal is binded by AngularUI Bootstrap.'
                    },

                    {
                        'url': 'assets/img/demo3.png',
                        'thumbUrl': 'http://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Waynejunction0810b.JPG/180px-Waynejunction0810b.JPG',
                        //          'caption': 'This image has dimensions 2272x1704 and the img element is scaled to fit inside the window. The left and right arrow keys are binded for navigation. The escape key for closing the modal is binded by AngularUI Bootstrap.'
                    },

                    {
                        'url': 'assets/img/demo4.png',
                        'thumbUrl': 'http://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Waynejunction0810b.JPG/180px-Waynejunction0810b.JPG',
                        //          'caption': 'This image has dimensions 2272x1704 and the img element is scaled to fit inside the window. The left and right arrow keys are binded for navigation. The escape key for closing the modal is binded by AngularUI Bootstrap.'
                    }

                ];

                self.exampleData = [
                    [0, 11.5],
                    [1, 12.5],
                    [2, 13.5],
                    [3, 14.5],
                    [4, 15.5],
                    [5, 16.5],
                    [6, 1.5],
                    [7, 13.5],
                    [8, 14.5],
                    [9, 15.5],
                    [10, 16.5],
                    [11, 1.5],
                    [12, 1.5],
                    [13, 13.5],
                    [14, 14.5],
                    [15, 15.5],
                    [16, 16.5],
                    [17, 11.5],
                    [18, 15.5],
                    [19, 19.5],
                    [20, 1.5],
                    [21, 12.5],
                    [22, 8.5],
                    [23, 15]
                ];

                self.exampleData2 = [
                    [0, 11.5],
                    [1, 12.5],
                    [2, 13.5],
                    [3, 24.5],
                    [4, 15.5],
                    [5, 16.5],
                    [6, 1.5],
                    [7, 3.5],
                    [8, 4.5],
                    [9, 15.5],
                    [10, 16.5],
                    [11, 11.5],
                    [12, 16.5],
                    [13, 3.5],
                    [14, 14.5],
                    [15, 15.5],
                    [16, 16.5],
                    [17, 11.5],
                    [18, 15.5],
                    [19, 19.5],
                    [20, 1.5],
                    [21, 22.5],
                    [22, 8.5],
                    [23, 10]
                ];

                self.xFunction = function () {
                    return function (d) {
                        return d[0];
                    };
                };
                self.yFunction = function () {
                    return function (d) {
                        return d[1];
                    };
                };

                self.colorFunction = function () {
                    return function (d, i) {
                        return '#E01B5D';
                    };
                };

                self.hideHeader = function () {
                    $global.set('headerBarHidden', true);
                    console.log("$interval.cancel SNRTimer: ", DevService.SNRTimer);

                    //todo move it to service
                    DevService.cancleHeaderTimers();
                };

                self.showDevDetail = function ($event, dev_uuid, lat, lng, isopen) {

                    //        console.info("showDevDetail dev_uuid: ", dev_uuid)
                    //        console.info("showDevDetail lat: ", lat)
                    //        console.info("showDevDetail lng: ", lng)

                    DashboardMapService.focusOnMarker(dev_uuid, lat, lng);
                    DevService.curDevuuid = dev_uuid;

                    if (isopen) {
                        DevService.getDevInfoByUid(dev_uuid).then(function (data) {

                            DevService.curGreenHouse = data;

                            $rootScope.$broadcast("ui:update:curDev", true);

                            //            console.info("---> showDevDetail: ", data)
                            //            console.info("---> DevService.curDevuuid: ", DevService.curDevuuid)
                            //            console.warn("--->self.geoGroups", self.geoGroups)

                            self.curDevInfo = data;
                        });

                    } // end if
                }; // showDevDetail


                self.$on('$destroy', function () {
                    $interval.cancel(DevService.showDetailTimer);
                    console.error("关闭 sidebar");

                });

                self.locateOnMap = function (lat, lng) {
                    self.curLocation = lat + lng;
                    console.log("location: " + lat + " " + lng);
                    MapService.setView(lat, lng);
                };

                //todo: add extra = online parmas

                DevService.getDevGroupList().then(function (data) {
                    self.Groups = data;
                });

                self.$on("update:addDevToGroup", function () {
                    DevService.getDevGroupList().then(function (data) {
                        self.Groups = data;
                    });
                });

                self.$on("update:removeDevToGroup", function () {
                    DevService.getDevGroupList().then(function (data) {
                        self.Groups = data;
                    });
                });

                self.showGroupDetail = function (groupName, isOpen) {
                    console.info("@groupName: ", groupName);
                    console.info("@isOpen: ", isOpen);

                    self.curSelectGroup = groupName;

                    if (true == isOpen) {
                        DevService.getDevListByGroup(groupName).then(function (data) {
                            console.warn(">>> >>> in Ctrl getDevListByGroup:  ", data);

                            var targetIndex = _.findIndex(self.Groups, function (el) {
                                return el.name == groupName;
                            });

                            self.Groups[targetIndex].children = data;
                            console.info("### ------> self.Groups: ", self.Groups);
                        });
                    } // if end

                }; // showGroupDetail end
            }])

        .controller("DashboardController", ['$scope', '$global', "DashboardMapService", "leafletEvents", "DevService", "$rootScope", "BaiduMapService",
            function ($scope, $global, DashboardMapService, leafletEvents, DevService, $rootScope, BaiduMapService) {
                var self = this; //casue html use as syntax

                //get All Smartgates
                DevService.getAllSmartgates().then(function (data) {
                    console.log("getAllSmartfates", data);
                    self.smartgates = data.data;
                    BaiduMapService.setup(self.smartgates);
                })

                self.center = DashboardMapService.getCenter();
                self.markers = DashboardMapService.getMarkers();

                self.layers = DashboardMapService.getLayers();
                self.events = DashboardMapService.getEvents();

                $scope.$on("leafletDirectiveMarker.click", function (event, args) {
                    $scope.eventDetected = event.name;
                    console.log("eventDetected: ", $scope.eventDetected);
                    console.log("eventDetected: ", args);
                });

            }]);
})();