/**
 * Created by xieyiming on 15-2-3.
 */


/**
 * Created by xieyiming on 15-1-11.
 */

(function () {
    'use strict';
    angular
        .module('page.analysis', [])
        // todo: rename the module or controller
        .controller('AnalysisController', ['$scope', 'HighchartService', 'UtilService', 'DevService', 'NotifyService', '$global', '$rootScope',
            function ($scope, HighchartService, UtilService, DevService, NotifyService, $global, $rootScope) {

                if (typeof String.prototype.startsWith != 'function') {
                    // see below for better implementation!
                    String.prototype.startsWith = function (str) {
                        return this.indexOf(str) == 0;
                    };
                }

                $rootScope.curPage = "analysis";
                $global.set('rightbarCollapsed', false);
                var self = $scope;

                self.$on('$destroy', function () {
                    $global.set('rightbarCollapsed', true);
                    console.error("关闭 sidebar analysis");
                });

                self.queryChartReq = {
                    curSensors: [],
                    sn: null,
                    date: "[" + UtilService.today() + "," + UtilService.tomorrow() + "]",
                    scope: "scope0",
                    device_type: 'humidity-temperature' //humidity
                }


                var doQueryChartData = function () {

                    if(self.queryChartReq.sn === null){

                        _.forEach(self.queryChartReq.curSensors ,function(Sensors){
                            self.queryChartReq.device_type = Sensors.dev_type;
                            self.queryChartReq.sn = Sensors.sn;
                            DevService.queryAnalysissData(self.queryChartReq).then(function (data) {

                                console.log("queryAnalysissData then get: ", data);

                                HighchartService.updateChartData(data.msg.data)

                                //_.extend(chartData, {data: data.msg.data.air_humidity})
                                self.queryChartReq.sn = null;
                            });
                        })
                    }else{

                        DevService.queryAnalysissData(self.queryChartReq).then(function (data) {

                            console.log("queryAnalysissData then get2: ", data.msg.data);

                            HighchartService.updateChartData(data.msg.data)

                        });
                    }


                }


                var queryChartData = function () {
                    _.extend(self.queryChartReq, {curSensors: self.curSensors})
                    _.extend(self.queryChartReq, {date: "[" + self.startDate + "," + self.endDate + "]"})
                    _.extend(self.queryChartReq, {startDate: new Date(self.startDate)}) //for chart
                    _.extend(self.queryChartReq, {sn: self.curSensorId})
                    _.extend(self.queryChartReq, {scope: self.chartSize})
                    _.extend(self.queryChartReq, {device_type: self.curType})

                    HighchartService.setStartDateTime(self.queryChartReq.startDate)
                    doQueryChartData()
                }

                self.typeModel = 'line'
                self.dayModel = 'today'
                self.sizeModel = 'scope2'

                self.curSensorId = null
                self.curSensors = null;
                self.chartSize = "scope2"
                self.range = "today"

                self.startDate = UtilService.today()
                self.endDate = UtilService.tomorrow()

                DevService.getProvinceList().then(function (data) {
                    self.geoGroups = data
                })

                self.showGeoGroupDetail = function (group, isopen) {

                    if (isopen) {

                        DevService.getCityList({province: group}).then(function (data) {

                            self.geoCities = data;

                            self.curGroupIndex = _.findIndex(self.geoGroups, function (el) {
                                return el.name == group;
                            })
                            self.geoGroups[self.curGroupIndex]["geoCities"] = self.geoCities;

                        })
                    }

                } // showGeoGroupDetail

                self.showGeoGityDetail = function (province, city, isopen) {
                    self.curCity = city

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
                    }

                } // showGeoGityDetail

                self.showGeoDistrictDetail = function (province, city, district, isopen) {

                    self.curDistrict = district;
                    self.curDistrictLocation = {};
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
                    }

                }; // showGeoDistrictDetail

                self.showDevDetail = function ($event, dev_uuid, lat, lng) {

                    self.curDev = dev_uuid

                    self.chartTitle = self.curCity + "-" + self.curDev

                    HighchartService.setTitle(self.chartTitle)

                    //        DevService.curDevuuid = dev_uuid
                        DevService.getDevInfoByUid(dev_uuid).then(function (data) {

                            self.curDevInfo = data

                            self.curSensor = data.components;
                                _.remove(self.curSensor, function(n) {
                                return n == null;
                            });
                            self.curSensors = _.omit(self.curSensor, function (o) {
                                return o.dev_type !== "humidity-temperature" && o.dev_type !== "illumination"
                            })

                            self.illumination_chartshow = false;
                            self.humidity_temperature_chartshow = false;

                           _.findKey(self.curSensors,function(el){
                               if(el.dev_type == "humidity-temperature"){
                                   self.humidity_temperature_chartshow = true;
                               }
                               if(el.dev_type == "illumination"){
                                   self.illumination_chartshow = true;
                               }
                            })

                                queryChartData();

                            self.showNotSelectError = false
                        })
                } // showDevDetail

                self.illumination_chartshow = true;
                self.humidity_temperature_chartshow = true;

                /*根据用户选择显示和获取历史曲线*/
                self.curType = null;//设备dev_type
                self.selectSensor = function (sn ,type) {
                    self.curSensorId = sn
                    self.curType = type
                    if(type ===  "humidity-temperature"){
                        self.humidity_temperature_chartshow = true;
                        self.illumination_chartshow = false;
                    }else{
                        self.illumination_chartshow = true;
                        self.humidity_temperature_chartshow = false;
                    }
                    self.showNotSelectError = false
                    queryChartData()
                }

                self.updateChartSize = function (size) {

                    self.chartSize = size
                    self.sizeModel = "'" + size + "'"
                    queryChartData()
                }

                // the chart staff

                self.updateChartType = function (ctype) {
                    HighchartService.updateChartType(ctype)
                }


              /*  self.dpWithCallback = {
                    onSelectedDateChanged: function (event, date) {
                        console.log("onSelectedDateChanged:" + moment(date).format("Do, MMM YYYY"))
                    }
                }*/

                self.anStartDateModel = UtilService.zhlize(UtilService.today())
                self.anEndDateModel = UtilService.zhlize(UtilService.tomorrow())

                self.dateModel = 'today'

                self.startDate = UtilService.today()
                self.endDate = UtilService.tomorrow()


                self.queryChartReq.startDate = new Date(self.startDate) //for chart
                HighchartService.setStartDateTime(self.queryChartReq.startDate)

                self.dateTimeTitle = moment(new Date()).format('MMMDo')

                self.temperature_chartOptionForTemp = HighchartService.getChartOption("temperature")
                self.lux_chartOptionForTemp = HighchartService.getChartOption("lux")


             /*   self.upFoldOpt = function () {
                    self.isDateStaffCollapsed = false
                }*/

                self.dateRangeConfirm = function () {
                    self.startDateTime = jQuery("#anStartDateModel").val() // bad
                    self.endDateTime = jQuery("#anEndDateModel").val() // bad
                    //        self.startDateTime = self.anStartDateModel
                    //        self.endDateTime = self.anEndDateModel

                    if (_.isEmpty(self.startDateTime) || _.isEmpty(self.endDateTime)) {
                        alert("请选择日期")
                        return false
                    }

                    self.startDate = UtilService.parseDateTime(self.startDateTime)
                    self.endDate = UtilService.parseDateTime(self.endDateTime)

                    var tmpStart = moment(self.startDateTime.split(" ")[0]).format('MMMDo') + self.startDateTime.split(" ")[1]
                    var tmpEnd = moment(self.endDateTime.split(" ")[0]).format('MMMDo') + self.endDateTime.split(" ")[1]

                    self.dateTimeTitle = tmpStart + " -- " + tmpEnd

                    if (_.isNull(self.curSensors)) {
                        self.showNotSelectError = true
                    } else {
                        self.showNotSelectError = false
                        queryChartData()
                    }
                }

                self.selectDateRange = function (range) {
                    self.range = range;
                    if (range == 'today') {
                        self.startDate = UtilService.today()
                        self.endDate = UtilService.tomorrow()
                        self.dateTimeTitle = UtilService.todaytitle()

                    } else if (range == 'week') {
                        self.chartSize = "scope2"
                        self.sizeModel = "scope2"
                        self.startDate = UtilService.weekAgo()
                        self.endDate = UtilService.tomorrow()
                        self.dateTimeTitle = UtilService.weektitle()

                    } else if (range == 'month') {
                        self.sizeModel = "scope2"
                        self.chartSize = "scope2"
                        self.startDate = UtilService.monthAgo()
                        self.endDate = UtilService.tomorrow()
                        self.dateTimeTitle = UtilService.monthtitle()
                    }

                    if (_.isNull(self.curSensors)) {
                        self.showNotSelectError = true
                    } else {
                        self.showNotSelectError = false
                        _.extend(self.queryChartReq, {scope: self.chartSize})
                        _.extend(self.queryChartReq, {date: "[" + self.startDate + "," + self.endDate + "]"})
                        _.extend(self.queryChartReq, {startDate: new Date(self.startDate)}) //for chart
                        HighchartService.setStartDateTime(self.queryChartReq.startDate)
                        doQueryChartData()
                    }
                }

            }])


})();






