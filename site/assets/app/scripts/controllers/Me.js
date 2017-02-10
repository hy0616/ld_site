/**
 * Created by xieyiming on 15-1-11.
 */

(function () {
    'use strict'
    angular
        .module('page.me', [])
        // todo: rename the module or controller
        .controller('MeController', ['$scope', 'UtilService', 'DevService', 'NotifyService', 'timeConversion', '$global', '$rootScope', "DashboardMapService", "HighchartService", "$timeout", "AuthService",
            function ($scope, UtilService, DevService, NotifyService, timeConversion, $global, $rootScope, DashboardMapService, HighchartService, $timeout, AuthService) {
                var self = $scope

                $global.set('rightbarCollapsed', false);

                $rootScope.curPage = "me"

                self.optsionPool = {}

                self.$on('$destroy', function () {
                    $global.set('rightbarCollapsed', true);
                    console.error("关闭 sidebar analysis")
                })

                self.chartConfig = {}

                /*query data and assignment chartConfig*/
                var doQueryChartData = function (query) {

                    DevService.queryAnalysissData(query).then(function (data) {

                        if (data.msg.data.air_temperature !== undefined) {

                            var charData_temperature = processing(data.msg.data.air_temperature);
                            self.chartConfig[query.sn + "temperature"].series[0].data = charData_temperature
                            self.chartConfig[query.sn + "temperature"].series[0].color = "#FF0000"
                            self.chartConfig[query.sn + "temperature"].yAxis.labels.format = '{value} ℃'
                            self.chartConfig[query.sn + "temperature"].series[0].name = "温度"
                        }
                        if (data.msg.data.air_humidity !== undefined) {
                            //humidity
                            var charData_humindity = processing(data.msg.data.air_humidity);
                            self.chartConfig[query.sn + "humidity"].series[0].data = charData_humindity
                            self.chartConfig[query.sn + "humidity"].series[0].color = "#32C3FD"
                            self.chartConfig[query.sn + "humidity"].yAxis.labels.format = '{value} %RH'
                            self.chartConfig[query.sn + "humidity"].series[0].name = "湿度"
                        }
                        if (data.msg.data.lux !== undefined) {
                            //lux
                            var charData_lux = processing(data.msg.data.lux);
                            self.chartConfig[query.sn + "illumination"].series[0].data = charData_lux
                            self.chartConfig[query.sn + "illumination"].series[0].color = "#FFB577"
                            self.chartConfig[query.sn + "illumination"].yAxis.labels.format = '{value} lux'
                            self.chartConfig[query.sn + "illumination"].series[0].name = "光照"
                        }

                    })
                }

                self.curUserData = {};//用户及大棚相关数据
                self.curUserData.username = AuthService.getUsername();//获取用户名

                var getUserInfo = function () {
                    DevService.getUserDev().then(function (data) {
                        self.curUserData = data.msg;
                        self.curUserData.username = AuthService.getUsername();

                        selectDefault();
                        self.chartConfig = HighchartService.getAllUserChartConfig()
                    })
                }

                getUserInfo()

                self.chartResize = function () {
                    $(window).resize();
                }

                self.devControl1 = function(pad, dev, status){
                    self.switchBtnsLoading[status] = true;
                    DevService.devControl1(pad, dev, status).then(function(){
                        self.switchBtnsLoading[status] = false;

                        _.forEach(self.padSmartgates, function (da) {
                            if (da.smartgate.sn === pad) {
                                _.forEach(da.components, function(el){
                                    if(el.sn == dev){
                                        el.status = status;
                                    }
                                })
                            }
                        })

                        $timeout(function(){
                            getUserInfo();
                        }, 10000)
                    })

                }


                self.switchBtns = {
                    forward: 0,
                    stop: 2,
                    back: 1
                };

                self.switchBtnsLoading = {};
                self.devControl2 = function(pad, dev, action){
                    self.switchBtnsLoading[action] = true;
                    DevService.devControl2(pad, dev, action).then(function(){
                        self.switchBtnsLoading[action] = false;

                        _.forEach(self.padSmartgates, function (da) {
                            if (da.smartgate.sn === pad) {
                                _.forEach(da.components, function(el){
                                    if(el.sn == dev){
                                        el.status = self.switchBtns[action];
                                    }
                                })
                            }
                        })

                        $timeout(function(){
                            getUserInfo();
                        }, 10000)
                    })

                }


                /*
                 * 根据时间查询历史数据'*/
                self.selectDate = function (Datetype, dev_uuid) {
                    self.optsionPool[dev_uuid].chartDate = Datetype;

                    var dateQuery = ''

                    if ('today' == Datetype) {
                        dateQuery = "[" + UtilService.today() + "," + UtilService.tomorrow() + "]"
                        self.optsionPool[dev_uuid].startDate = UtilService.today()
                        self.optsionPool[dev_uuid].endDate = UtilService.tomorrow()
                    } else if ('week' == Datetype) {
                        self.optsionPool[dev_uuid].chartSize = "scope2"
                        dateQuery = "[" + UtilService.weekAgo() + "," + UtilService.today() + "]"
                        self.optsionPool[dev_uuid].startDate = UtilService.weekAgo()
                        self.optsionPool[dev_uuid].endDate = UtilService.today()
                    } else if ('month' == Datetype) {
                        self.optsionPool[dev_uuid].chartSize = "scope2"
                        dateQuery = "[" + UtilService.monthAgo() + "," + UtilService.today() + "]"
                        self.optsionPool[dev_uuid].startDate = UtilService.monthAgo()
                        self.optsionPool[dev_uuid].endDate = UtilService.today()
                    }

                    var tempQuery = {
                        sn: dev_uuid,
                        date: dateQuery,
                        scope: self.optsionPool[dev_uuid].chartSize, // first time use hour as default
                        device_type: 'smartgate'
                    }

                    doQueryChartData(tempQuery)
                }

                /*
                 * 根据力度查询历史数据
                 */
                self.selectSize = function (size, dev_uuid) {
                    self.optsionPool[dev_uuid].chartSize = size

                    var tempQuery = {
                        sn: dev_uuid,
                        date: "[" + self.optsionPool[dev_uuid].startDate + "," + self.optsionPool[dev_uuid].endDate + "]",
                        scope: size, // first time use hour as default
                        device_type: 'smartgate'
                    }

                    doQueryChartData(tempQuery)
                }

                /*
                 * 用户选择显示图标样式类型*/
                self.selectType = function (chartType, dev_uuid) {
                    self.optsionPool[dev_uuid].chartType = chartType

                    self.chartConfig[dev_uuid + 'temperature'].options.chart.type = chartType
                    self.chartConfig[dev_uuid + 'humidity'].options.chart.type = chartType
                    self.chartConfig[dev_uuid + 'illumination'].options.chart.type = chartType
                }

                //processing date
                var processing = function (el) {
                    var air_temperature_data = [];
                    var air_temperature = [];
                    _.forEach(el, function (data) {

                        //历史时间由世界时转换为东八区时间
                        var oldTime = (new Date(data.time.substr(0, 4) + "/" + data.time.substr(5, 2) + "/" + data.time.substr(8, 2) + " " + data.time.substr(11, 2)
                                + ":" + data.time.substr(14, 2))).getTime() + 8 * 60 * 60 * 1000;

                        var newTime = new Date(oldTime);

                        //query curve time and historical data
                        air_temperature = [Date.UTC(newTime.getFullYear(), newTime.getUTCMonth(), newTime.getDate(), newTime.getHours(), newTime.getMinutes()), data.value]
                        air_temperature_data.push(air_temperature);

                    })
                    return air_temperature_data;
                }


                self.layers = {
                    baselayers: DashboardMapService.getBaselayer(),
                    overlays: {}

                }

                self.center = DashboardMapService.getCenter()


                function setchar(dev) {

                    self.optsionPool[dev.smartgate.sn] = {
                        'chartDate': 'today',
                        'chartSize': 'scope2',
                        'chartType': "line",
                        'startDate': UtilService.today(),
                        'endDate': UtilService.tomorrow(),
                    }

                    var tempQuery = {
                        sn: dev.smartgate.sn,
                        date: "[" + UtilService.today() + "," + UtilService.tomorrow() + "]",
                        scope: "scope2",
                        device_type: 'smartgate'
                    }

                    doQueryChartData(tempQuery);
                    HighchartService.initUserChartConfig(dev.smartgate.sn, "temperature")
                    HighchartService.initUserChartConfig(dev.smartgate.sn, "humidity")
                    HighchartService.initUserChartConfig(dev.smartgate.sn, "illumination")
                }

                //watch select pad data
                self.watchPad = {val: ""};

                //init pad data
                var record = true;
                function selectDefault() {

                    self.padSmartgates = _.forEach(self.curUserData.smartgates, function (val) {
                        val.smartgate.plant_time = val.smartgate.plant_time.substr(0, 4) + "-" +
                            val.smartgate.plant_time.substr(4, 2) + "-" +
                            val.smartgate.plant_time.substr(6, 2);

                        val.smartgate.harvest_time = val.smartgate.harvest_time.substr(0, 4) + "-" +
                            val.smartgate.harvest_time.substr(4, 2) + "-" +
                            val.smartgate.harvest_time.substr(6, 2);

                        if (val.components.length != 0) {
                            //转换日期格式-最后更新时间
                            _.forEach(val.components, function (ba) {
                                ba.server_time = timeConversion.conversion(ba.server_time)
                            })
                        }

                    })

                    console.log("pad",self.padSmartgates);
                    // select default first data

                    if(record){

                        if(self.padSmartgates.length === 0){
                            self.padData ={};
                        }else{
                            _.first(self.padSmartgates, function (val) {

                                self.watchPad.val = val.smartgate.sn;
                                self.padData = val;
                                self.padRecord = val;
                                setchar(val);

                            })
                        }

                        record = false;
                    }else{
                        _.forEach(self.padSmartgates, function(da){
                            if(da.smartgate.sn ==  self.padRecord.smartgate.sn){
                                self.padData = da;
                            }
                        })
                    }
                }

                //update pad data
                self.padProcessing = function (val) {
                    _.forEach(self.padSmartgates, function (da) {
                        if (da.smartgate.sn === val) {
                            self.padData = da;
                            self.padRecord = da;
                            setchar(da);
                            /*传感器排序*/
                            /*self.sort_curGreenHouse = _.sortBy(da.components, function (item) {
                             return item.dev_type;
                             })*/
                        }
                    })
                }

                self.equipment_show = true;
                self.statistics_show = false;
                //self.control_show = false;
                self.refresh_show = false;

                self.equipment = function () {
                    self.equipment_show = true;
                    self.statistics_show = false;
                    self.control_show = false;
                    self.refresh_show = false;
                }

                self.statistics = function () {
                    self.equipment_show = false;
                    self.statistics_show = true;
                    self.control_show = false;
                    self.refresh_show = false;
                }

                /*self.control = function () {
                    self.equipment_show = false;
                    self.statistics_show = false;
                    self.control_show = true;
                    self.refresh_show = false;
                }*/

                self.refresh = function () {
                    getUserInfo()
                }

                self.dev_delete = function (pad, dev) {

                    if (confirm('确认删除该设备吗?')) {

                        DevService.DevDelete(pad.smartgate.sn, dev.sn).then(function () {
                            getUserInfo();
                        })

                    } else {
                        return false;
                    }

                }

                self.pad_delete = function(id){

                    if(confirm('确认删除该网关吗?')){
                        DevService.padDelete(id).then(function(){
                            getUserInfo();
                        })
                    }else{
                        return false;
                    }

                }

                //end
            }
        ])


})();



