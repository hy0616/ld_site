/**
 * Created by hy on 15-8-20.
 */
(function () {
    'use strict';

    angular.module('page.alarm', ['ngGrid'])

        .controller('Alarm_View', ['$rootScope', '$scope', '$global', function($rootScope, $scope, $global){

            var self = $scope;

            $rootScope.curPage = "alarm"

            $global.set('rightbarCollapsed', false);
            self.$on('$destroy', function () {
                $global.set('rightbarCollapsed', true);
                console.error("关闭 sidebar alarm");
            });

            self.switch_view = {
                message_view1: true,
                message_view2: false,
                setting_view: false,
                reserve_view:false
            }

            self.switchView = function(item){
                self.switch_view[item] = true;
                if(self.switch_view["message_view1"] = true){
                    self.$broadcast("updateMessageView1", true);
                }
                _.forEach(self.switch_view, function(value, key){
                    if(item != key){
                        self.switch_view[key] = false;
                    }
                })
            }

        }])

        .controller('AlarmController', ['$scope', '$q', '$rootScope', 'DevService', '$global','$filter',
            function ($scope, $q, $rootScope, DevService, $global, $filter) {

                var self = $scope

                $global.set('rightbarCollapsed', false);
                self.$on('$destroy', function () {
                    $global.set('rightbarCollapsed', true);
                    console.error("关闭 sidebar alarm");
                });

                //   未读/已读状态
                self.unread_event = true;

                //监听搜索
                self.miinput = {
                    inputText: ""
                };

               /* self.filterOptions = {
                    filterText: self.miinput.inputText,
                    useExternalFilter: true
                };*/
                self.totalServerItems = 0;
                self.pagingOptions = {
                    pageSizes: [15, 30, 50],
                    pageSize: 15,
                    currentPage: 1,
                };

                self.readpage = 1;
                self.pageForward = function(){
                    self.readpage = self.readpage+1;
                }
                self.setPagingData = function (data, unpage, page, pageSize) {
                    //var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
                    self.myData = data;
                    self.totalServerItems = unpage;
                    if (!self.$$phase) {
                        self.$apply();
                    }
                };
                self.getPagedDataAsync = function (pageSize, page, searchText) {

                    if (self.unread_event) {
                        setTimeout(function () {
                            DevService.getAlarmUnreadEvents(self.pagingOptions.currentPage).then(function (details) {
                                console.log("unread_data", details);
                                self.setPagingData(details.data.msg, details.data.count, page, pageSize);
                            });
                        }, 100);
                        self.unread_event = true;
                    } else {

                        setTimeout(function () {
                            var data;
                            if (searchText) {
                                var ft = searchText.toLowerCase();
                                    DevService.getAlarmOnreadEvents().then(function (largeLoad) {
                                        _.forEach(largeLoad.data.msg, function(el){
                                            el.event_date = $filter('date')(new Date(el.event_date),'yyyy-MM-dd HH:mm:ss')
                                        })

                                    data = largeLoad.data.msg.filter(function (item) {
                                        return JSON.stringify(item.event_date).toLowerCase().indexOf(ft) != -1;
                                    });
                                        console.log("search_data",data)
                                    self.setPagingData(data, data.length, page, pageSize);
                                });
                            } else {
                                DevService.getAlarmOnreadEvents(self.pagingOptions.currentPage).then(function (largeLoad) {
                                    console.log("onnread_data", largeLoad);
                                    self.setPagingData(largeLoad.data.msg, largeLoad.data.count, page, pageSize);
                                });
                            }
                        }, 100);
                        self.unread_event = false;
                    }

                };
                self.getPagedDataAsync(self.pagingOptions.pageSize, self.pagingOptions.currentPage);
                self.$watch('pagingOptions', function (newVal, oldVal) {
                    if (newVal !== oldVal && (newVal.currentPage !== oldVal.currentPage) || (newVal.pageSize !== oldVal.pageSize)) {
                        self.getPagedDataAsync(self.pagingOptions.pageSize, self.pagingOptions.currentPage);
                    }
                }, true);

                self.$watch('miinput', function () {
                    if (self.miinput.inputText !== "") {
                        self.pagingOptions.currentPage = 1;
                        self.getPagedDataAsync(self.pagingOptions.pageSize, self.pagingOptions.currentPage, self.miinput.inputText);
                    }
                }, true);

                self.gridOptions = {
                    selectWithCheckboxOnly: true,//禁止行选择
                    selectedItems: [],//选择数组
                    rowHeight: '38',//行高
                    data: 'myData',//数据源
                    multiSelect: true,//多选
                    showSelectionCheckbox: true,
                    enablePaging: true,//开启分页
                    showFooter: true,//页脚
                    headerRowHeight: '39',//头行高
                    totalServerItems: 'totalServerItems',//数据总条数
                    pagingOptions: self.pagingOptions,//分页选项
                    i18n: 'zh-cn',//中文
                    //showFilter:true,
                    //filterOptions: self.filterOptions,
                    footerTemplate: 'views/templates/ng-grid-footer.html',
                    checkboxHeaderTemplate:'<input class="ngSelectionHeader" type="checkbox" ng-model="$parent.allSelected" ng-change="toggleSelectAll($parent.allSelected)"/>',
                    columnDefs: [
                        {
                            headerCellTemplate: 'views/templates/ng-headerCell.html',
                            cellTemplate: 'views/templates/ng-unread-detailed.html'

                        }
                    ]//行配置栏
                };

                //获取单击行信息
                self.getrow = function (row) {
                    self.detailed = row.entity
                }

                //Refresh
                self.refresh = function () {
                    self.getPagedDataAsync(self.pagingOptions.pageSize, self.pagingOptions.currentPage);
                    self.gridOptions.selectedItems.length = 0;
                    self.gridOptions.$gridScope['allSelected'] = false;//取消全选
                }

                //单击未读按钮触发事件
                self.unread = function () {
                    self.unread_event = true;
                    self.getPagedDataAsync(self.pagingOptions.pageSize, self.pagingOptions.currentPage);
                    self.pagingOptions.currentPage = 1;
                    self.gridOptions.$gridScope['allSelected'] = false;//取消全选
                }

                self.$on("updateMessageView1", function(){
                    self.unread();
                })

                //单击已读按钮触发事件
                self.onread = function () {
                    self.unread_event = false;
                    self.gridOptions.selectedItems.length = 0;
                    self.getPagedDataAsync(self.pagingOptions.pageSize, self.pagingOptions.currentPage);
                    self.pagingOptions.currentPage = 1;
                    self.gridOptions.$gridScope['allSelected'] = false;//取消全选

                }

                //单击设为已读按钮触发事件
                self.setting_onread = function () {
                    var temp = {};
                    temp.event_id_arr = ""

                    if (self.gridOptions.selectedItems.length > 0) {

                        _.forEach(self.gridOptions.selectedItems, function (el) {

                            temp.event_id_arr += el.event_id + ","
                        })
                        temp.event_id_arr = temp.event_id_arr.substr(0, temp.event_id_arr.length - 1);

                        DevService.updateOnread(temp).then(function () {

                            self.refresh();
                            self.gridOptions.selectedItems.length = 0;
                        })
                    } else {
                        alert("请选择消息")
                    }
                }

            }
        ])

        .controller('AlarmSetDisplay', ['$scope', '$q', '$rootScope', 'DevService', 'AlarmStrategy', '$global',
            function ($scope, $q, $rootScope, DevService, AlarmStrategy, $global) {

                var self = $scope;

                $global.set('rightbarCollapsed', false);
                self.$on('$destroy', function () {
                    $global.set('rightbarCollapsed', true);
                    console.error("关闭 sidebar alarm");
                });

                //get user 大棚信息
                DevService.getUserDev().then(function (data) {
                    self.UserDev = data.msg;
                })

                self.alarm = {}//alarm data
                self.sn = ""

                //watch 大棚信息 get alarm
                self.getSmartgate = function (watch_dev) {

                    self.sn = watch_dev.smartgate.sn;
                        //get alarm data
                        DevService.getShed(watch_dev.smartgate.sn).then(function (data) {
                            self.alarm.list = data.data;
                        })

                }

                //设置门限时获取sn
                self.getsn = function(sn){

                    self.sn = sn;
                }

                //update alarm data
                self.$on('updata:shed', function (event, sn) {
                    DevService.getShed(sn).then(function (data) {
                        self.alarm.list = data.data;
                    })

                });

                self.select_strategy = AlarmStrategy.strategy();//select on setting_strategy
                self.$on('update:CustomChange', function () {
                    self.select_strategy = AlarmStrategy.strategy();
                })

                self.setting_strategy = {};

                //get setting
                self.setting_select = function (val) {

                    self.setting_strategy = val;

                }

                //get default strategy
                self.strategy_default = {};
                DevService.getstrategy_default().then(function (data) {
                    self.strategy_default = data.data
                });

                self.datas = {};
                self.datas.temp = false;
                self.setting_checkbox = function (data) {
                    if (!data) {
                        self.setting_strategy = {};
                        self.datas.val = null;
                    }
                }

                var post_strategy = {};
                //"YBF000000000000002"
                self.setting_custom = function (custom) {

                    if (custom == true) {
                        post_strategy.alarm_strategy = self.setting_strategy;
                        post_strategy.strategy_type = "temp";
                        DevService.addShed(self.sn, post_strategy).then(function () {

                        })

                    } else {

                        if(!self.setting_strategy)return false;

                        post_strategy.strategy_id = self.setting_strategy.strategy_id;

                        var strategy_id = "";
                        _.forEach(self.strategy_default, function (val) {
                            if (val.strategy_id == self.setting_strategy.strategy_id) {

                                strategy_id = val.strategy_id;
                            }
                        })

                        if (strategy_id == self.setting_strategy.strategy_id) {
                            post_strategy.strategy_type = "default";
                        } else {
                            post_strategy.strategy_type = "customer";
                        }
                        DevService.addShed(self.sn, post_strategy).then(function () {
                        });
                    }

                }

            }])

        .controller('AlarmCustom', ['$scope', '$q', '$rootScope', 'DevService', '$global',
            function ($scope, $q, $rootScope, DevService, $global) {

                var self = $scope;

                $global.set('rightbarCollapsed', false);
                self.$on('$destroy', function () {
                    $global.set('rightbarCollapsed', true);
                    console.error("关闭 sidebar alarm");
                });

                // query add update delete strategy,

                self.custom = {};
                self.strategy = {};

                self.button = {
                    add: true,
                    update: false,
                    delete: false
                }

                self.detail = function (custom) {
                    self.strategy = custom;
                    self.button.add = false;
                    self.button.update = true;
                    self.button.delete = true;
                }

                DevService.getCustom().then(function (data) {
                    self.custom.list = data.data;
                })

                self.$on("update:CustomChange", function () {

                    DevService.getCustom().then(function (data) {
                        self.custom.list = data.data;

                    })
                });


                var add_value = {};
                add_value.alarm_strategy = {};

                self.addCustom = function (custom) {

                    if (custom.strategy_name != undefined) {
                        add_value.alarm_strategy = custom;

                        DevService.addCustom(add_value).then(function () {

                        });

                        self.strategy = {};
                    } else {
                        alert("请填写预案名称")
                    }

                }

                var update_value = {};
                update_value.alarm_strategy = {};
                self.updateCustom = function (custom, id) {
                    update_value.alarm_strategy = custom;

                    DevService.updateCustom(update_value, id).then(function () {

                    })
                    self.strategy = {};
                    self.button.add = true;
                    self.button.update = false;
                    self.button.delete = false;
                }

                self.deleteCustom = function (id) {
                    if (confirm("确认删除？")) {

                        DevService.deleteCustom(id).then(function () {

                        })
                        self.strategy = {};
                        self.button.add = true;
                        self.button.update = false;
                        self.button.delete = false;
                    } else {
                        return false;
                    }

                };

                self.empty = function () {

                    self.button.add = true;
                    self.button.update = false;
                    self.button.delete = false;
                    self.strategy = {};
                }

                //end
            }])

})();
