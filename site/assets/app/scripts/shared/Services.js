(function () {
    'use strict'

    angular
        .module('theme.services', [])
        .service('$global', ['$rootScope', 'EnquireService', '$document', function ($rootScope, EnquireService, $document) {
            this.settings = {
                fixedHeader: true,
                headerBarHidden: true,
                leftbarCollapsed: true,
                leftbarShown: false,
                rightbarCollapsed: false,
                fullscreen: false,
                layoutHorizontal: false,
                layoutHorizontalLargeIcons: false,
                layoutBoxed: false,
                showSearchCollapsed: false
            };

            var brandColors = {
                'default': '#ecf0f1',

                'inverse': '#95a5a6',
                'primary': '#3498db',
                'success': '#2ecc71',
                'warning': '#f1c40f',
                'danger': '#e74c3c',
                'info': '#1abcaf',

                'brown': '#c0392b',
                'indigo': '#9b59b6',
                'orange': '#e67e22',
                'midnightblue': '#34495e',
                'sky': '#82c4e6',
                'magenta': '#e73c68',
                'purple': '#e044ab',
                'green': '#16a085',
                'grape': '#7a869c',
                'toyo': '#556b8d',
                'alizarin': '#e74c3c'
            };

            this.getBrandColor = function (name) {
                if (brandColors[name]) {
                    return brandColors[name];
                } else {
                    return brandColors['default'];
                }
            };

            $document.ready(function () {
                EnquireService.register("screen and (max-width: 767px)", {
                    match: function () {
                        $rootScope.$broadcast('globalStyles:maxWidth767', true);
                    },
                    unmatch: function () {
                        $rootScope.$broadcast('globalStyles:maxWidth767', false);
                    }
                });
            });

            this.get = function (key) {
                return this.settings[key];
            };
            this.set = function (key, value) {
                this.settings[key] = value;
                $rootScope.$broadcast('globalStyles:changed', {key: key, value: this.settings[key]});
                $rootScope.$broadcast('globalStyles:changed:' + key, this.settings[key]);
            };
            this.values = function () {
                return this.settings;
            };
        }])
        .factory('pinesNotifications', function () {
            return {
                notify: function (args) {
                    var notification = $.pnotify(args);
                    notification.notify = notification.pnotify;
                    return notification;
                },
                defaults: $.pnotify.defaults
            }
        })
        .factory('progressLoader', function () {
            return {
                start: function () {
                    $(document).skylo('start');
                },
                set: function (position) {
                    $(document).skylo('set', position);
                },
                end: function () {
                    $(document).skylo('end');
                },
                get: function () {
                    return $(document).skylo('get');
                },
                inch: function (amount) {
                    $(document).skylo('show', function () {
                        $(document).skylo('inch', amount);
                    });
                }
            }
        })
        .factory('EnquireService', ['$window', function ($window) {
            var enquire = $window.enquire;
            return enquire;
        }])
        .factory('$bootbox', ['$modal', function ($modal) {
            // NOTE: this is a workaround to make BootboxJS somewhat compatible with
            // Angular UI Bootstrap in the absence of regular bootstrap.js
            if ($.fn.modal == undefined) {
                $.fn.modal = function (directive) {
                    var that = this;
                    if (directive == 'hide') {
                        if (this.data('bs.modal')) {
                            this.data('bs.modal').close();
                            $(that).remove();
                        }
                        return;
                    } else if (directive == 'show') {
                        return;
                    }

                    var modalInstance = $modal.open({
                        template: $(this).find('.modal-content').html()
                    });
                    this.data('bs.modal', modalInstance);
                    setTimeout(function () {
                        $('.modal.ng-isolate-scope').remove();
                        $(that).css({
                            opacity: 1,
                            display: 'block'
                        }).addClass('in');
                    }, 100);
                };
            }

            return bootbox;
        }])
        .service('lazyLoad', ['$q', '$timeout', function ($q, $t) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            this.load = function (files) {
                angular.forEach(files, function (file) {
                    if (file.indexOf('.js') > -1) { // script
                        (function (d, script) {
                            var fDeferred = $q.defer();
                            script = d.createElement('script');
                            script.type = 'text/javascript';
                            script.async = true;
                            script.onload = function () {
                                $t(function () {
                                    fDeferred.resolve();
                                });
                            };
                            script.onerror = function () {
                                $t(function () {
                                    fDeferred.reject();
                                });
                            };

                            promise = promise.then(function () {
                                script.src = file;
                                d.getElementsByTagName('head')[0].appendChild(script);
                                return fDeferred.promise;
                            });
                        }(document));
                    }
                });

                deferred.resolve();

                return promise;
            };
        }])
        .filter('safe_html', ['$sce', function ($sce) {
            return function (val) {
                return $sce.trustAsHtml(val);
            };
        }])

        .factory('AlarmStrategy', ['$q', '$rootScope', 'DevService',
        function ($q, $rootScope, DevService) {

            return {
                strategy: function () {
                    var select_strategy = [];
                    DevService.getstrategy_default().then(function (data) {
                        _.forEach(data.data, function (el) {
                            select_strategy.push(format(el));
                        });

                    });

                    DevService.getCustom().then(function (data) {

                        _.forEach(data.data, function (el) {
                            select_strategy.push(format(el));
                        });
                    })

                    var format = function (data) {
                        var temp = {};
                        temp["strategy_id"] = data.strategy_id;
                        temp["strategy_name"] = data.strategy_name;
                        temp["charge_config"] = data.charge_config;
                        temp["air_temperature_config"] = data.air_temperature_config;
                        temp["air_humidity_config"] = data.air_humidity_config;
                        temp["co_ppm_config"] = data.co_ppm_config;
                        temp["co2_ppm_config"] = data.co2_ppm_config;
                        temp["soil_temperature_config"] = data.soil_temperature_config;
                        temp["soil_humidity_config"] = data.soil_humidity_config;
                        temp["soil_moisture_config"] = data.soil_moisture_config;
                        temp["lux_config"] = data.lux_config;
                        temp["rain_config"] = data.rain_config;

                        return temp;
                    }

                    return select_strategy;
                }

            }
        }])

        .factory('timeConversion',[function(){
            return{
                conversion: function(oldtime){

                    var newtime ;
                    var localtime = new Date();
                    var minutes = localtime.getTimezoneOffset();
                    if(minutes < 0){

                        newtime =new Date(Number(oldtime) - minutes * 60 * 1000);
                    }else{
                        newtime = new Date(Number(oldtime) + minutes * 60 * 1000);
                    }
                    return newtime;
                }
            }
        }])

})();



