'use strict';


var monitorApp = angular.module('mainApp', [
    'lodash',
    'app.models.index',
    'app.service.index',

    'ui.bootstrap',
    'ngSails',
    'toastr',
    'formFor',
    'formFor.defaultTemplates',

    'xeditable',
    'bootstrapLightbox',
    'theme.services',
    'theme.directives',
    'theme.navigation-controller',
    'shareData',

    'theme.leafletMap',
    'theme.headerTile',
    'theme.ui-panels',

    "highcharts-ng",
    'theme.pages-controllers',

    'page.dashboard',
    'page.analysis',
    'page.me',
    'page.manager',
    'page.alarm',
    'page.personal',

    'pascalprecht.translate',

    'theme.templates',
    'theme.template-overrides',

    'ui.odometer',
    "angularMoment",
    'ngRoute',
    'ngAnimate'
]);


monitorApp.constant('angularMomentConfig', {
    preprocess: 'utc'
//  timezone: 'Europe/Berlin'
});

monitorApp.run(function (amMoment) {
    amMoment.changeLocale('zh-cn');
});

monitorApp.run(function (editableOptions, editableThemes) {
    editableOptions.theme = 'bs3';
    editableThemes.bs3.inputClass = 'input-sm';
    editableThemes.bs3.buttonsClass = 'btn-xs btn-default margin-top-5';
});

monitorApp.controller('MainController', ['$scope', '$global', '$timeout', 'progressLoader', '$location', '$rootScope', 'AuthService', 'PushWebService',
    function ($scope, $global, $timeout, progressLoader, $location, $rootScope, AuthService, PushWebService) {

        //AuthService.checkLogin();
        AuthService.loginRequired();

        $scope.username = AuthService.getUsername();

        //连接socket
        PushWebService.init($scope.username);
        //接受推送状态
        $scope.push_state = false;
        $scope.url = '#/cm-alarm';
        $scope.$on('event_push', function (event, data) {
            $scope.push_data = data;
            PushWebService.UpdateData();
            $scope.push_state = true;
            $scope.messages = data.length;
        })
        //更新推送状态
        $scope.refresh_state = function () {
            $rootScope.$broadcast('update navigational state',true);
            $scope.messages="";
            $scope.push_state = false;
        }


        $scope.logOut = function () {
            AuthService.logOut();
        };

        $scope.style_fixedHeader = $global.get('fixedHeader');
        $scope.style_headerBarHidden = $global.get('headerBarHidden');
        $scope.style_layoutBoxed = $global.get('layoutBoxed');
        $scope.style_fullscreen = $global.get('fullscreen');
        $scope.style_leftbarCollapsed = $global.get('leftbarCollapsed');
        $scope.style_leftbarShown = $global.get('leftbarShown');
//  $scope.style_rightbarCollapsed = $global.get('rightbarCollapsed')
        $scope.style_rightbarCollapsed = true;
        $scope.style_isSmallScreen = false;
        $scope.style_showSearchCollapsed = $global.get('showSearchCollapsed');

        $scope.hideSearchBar = function () {
            $global.set('showSearchCollapsed', false);
        };

        $scope.hideHeaderBar = function () {
            $global.set('headerBarHidden', true);
        };

        $scope.showHeaderBar = function ($event) {
            $event.stopPropagation();
            $global.set('headerBarHidden', false);
        };

        $scope.toggleLeftBar = function () {
            if ($scope.style_isSmallScreen) {
                return $global.set('leftbarShown', !$scope.style_leftbarShown);
            }
            $global.set('leftbarCollapsed', !$scope.style_leftbarCollapsed);
        };


        $scope.toggleRightBar = function () {
            console.info("$scope.style_rightbarCollapsed: ", $scope.style_rightbarCollapsed);
            $global.set('rightbarCollapsed', !$scope.style_rightbarCollapsed);
        };

        $scope.$on('globalStyles:changed', function (event, newVal) {
            $scope['style_' + newVal.key] = newVal.value;
        });


        $scope.$on("ui.group.changed", function (e, mode) {
            if (mode == 'custom') {
                $scope.rightbarAccordions[0].open = false;
            } else {
                $scope.rightbarAccordions[0].open = true;
            }
        });

        $scope.$on('globalStyles:maxWidth767', function (event, newVal) {
            $timeout(function () {
                $scope.style_isSmallScreen = newVal;
                if (!newVal) {
                    $global.set('leftbarShown', false);
                } else {
                    $global.set('leftbarCollapsed', false);
                }
            });
        });

        // there are better ways to do this, e.g. using a dedicated service
        // but for the purposes of this demo this will do :P
        // $scope.isLoggedIn = true;
        // $scope.logOut = function () {
        //   $scope.isLoggedIn = false;
        // };

        // $scope.logIn = function () {
        //   $scope.isLoggedIn = true;
        // };

        $scope.rightbarAccordionsShowOne = false;
        $scope.rightbarAccordions = [
            {open: true},
            {open: true},
            {open: true},
            {open: true},
            {open: true},
            {open: true},
            {open: true}
        ];

        $scope.$on('$routeChangeStart', function (e) {
            progressLoader.start();
            progressLoader.set(50);
        });
        $scope.$on('$routeChangeSuccess', function (e) {
            progressLoader.end();
        });
    }]);

monitorApp.config(['$translateProvider', function ($translateProvider) {
    $translateProvider.translations('zh', {
        "GREENHOUSE_LIST": "大棚列表",
        "SENSOR_LIST": "传感器列表",
        "SET_ERELAY_SWITCH": "设置继电器",
        "COMPONENT_ID": "编号",
        "STATUS": "开关",
        "SET_UTC_OFFSET": "时区设置",
        "SET_NTP": "NTP服务器",
        "UPGRADE": "远程升级",

        "HUMIDITY": "湿度",
        "TEMPERATURE": "温度",
        "ERELAY": "继电器",
        "CAMERA": "摄像头",

        "TIME_BEGAIN": "开始",
        "TIME_END": "结束",
        "CANCLE": "取消",
        "CONFIRM": "确定",
        "DEV_LIST": "大棚列表",
        "FREQ_LIST": "频率列表",
        "ANALYSIS_TITLE": "统计分析",
        "CUSTOM": "自定义",
        "SNR": "信噪比",
        "RSSI": "场强",
        "CORR": "反向值",
        "TODAY": "今天",
        "WEEK": "本周",
        "MONTH": "本月",
        "DEV_NAME": "设备名称",
        "CHANNEL": "通道",
        "CHN_SUMMARY": "大棚监测",
        "CHN_TOTAL_CNT": "大棚总数",
        "ONLINE": "在线",
        "OFFLINE": "离线",
        "LOGO_TITLE": "云养监控",
        "CTRL_SWITCH": "设备列表"
    });


//  $translateProvider.translations('en',.get('en'));

    $translateProvider.preferredLanguage('zh');
}]);

// the route staff
monitorApp.config(['$provide', '$routeProvider', function ($provide, $routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/index.html'
        })

        .when('/:templateFile', {
            templateUrl: function (param) {
                console.log("/:templateFile : ", param.templateFile);
                return 'views/' + param.templateFile + '.html';
            }
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

monitorApp.service("AuthInterceptor", function ($q, $injector) {
    var self = this;

    var localStorageService = $injector.get("localStorageService");
    self.request = function (config) {
        var token = localStorageService.get('token');

        if (token) {
            config.headers.Authorization = 'Bearer ' + token;
        }
        return config;
    };

});

monitorApp.config(function ($httpProvider) {
    $httpProvider.interceptors.push("AuthInterceptor");
    //  angular.forEach($cookies, function (v, k) {
    //    $cookieStore.remove(k);
    //  });
});

