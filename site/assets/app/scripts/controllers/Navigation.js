(function () {
    'use strict';

    angular
        .module('theme.navigation-controller', [])
        .controller('NavigationController', ['$scope', '$location', '$timeout', '$global', function ($scope, $location, $timeout, $global) {

            $scope.menu = [
                {
                    label: '首页',
                    iconClasses: 'fa fa-home',
                    url: '#/'
                },

                {
                    label: '我的大棚',
                    iconClasses: 'fa fa-user',
                    url: '#/cm-me'
                },

                {
                    label: '统计分析',
                    iconClasses: 'fa fa-bar-chart-o',
                    url: '#/cm-analysis'
                },

                /*  {
                 label: '设备用户管理',
                 iconClasses: 'fa fa-table',
                 url: '#/cm-manager'
                 },*/

                {
                    label: '报警管理',
                    iconClasses: 'fa fa-bell',
                    url: '#/cm-alarm'
                }

                //      {
                //        label: '日志报警',
                //        iconClasses: 'fa fa-table',
                //        url: '#/tables-responsive'
                //      }

                //      {
                //        label: 'Maps',
                //        iconClasses: 'fa fa-map-marker',
                //        children: [
                //
                //          {
                //            label: 'Vector Maps',
                //            url: '#/maps-vector'
                //          }
                //        ]
                //      },
                //      {
                //        label: '统计分析',
                //        iconClasses: 'fa fa-bar-chart-o',
                //        children: [
                //          {
                //            label: 'Extensible',
                //            url: '#/charts-flot'
                //          },
                //          {
                //            label: 'Interactive',
                //            url: '#/charts-svg'
                //          },
                //          {
                //            label: 'Lightweight',
                //            url: '#/charts-canvas'
                //          },
                //          {
                //            label: 'Inline',
                //            url: '#/charts-inline'
                //          }
                //        ]
                //      }

            ];

            var setParent = function (children, parent) {
                angular.forEach(children, function (child) {
                    child.parent = parent;
                    if (child.children !== undefined) {
                        setParent(child.children, child);
                    }
                });
            };

            $scope.findItemByUrl = function (children, url) {
                for (var i = 0, length = children.length; i < length; i++) {
                    if (children[i].url && children[i].url.replace('#', '') == url) return children[i];
                    if (children[i].children !== undefined) {
                        var item = $scope.findItemByUrl(children[i].children, url);
                        if (item) return item;
                    }
                }
            };

            setParent($scope.menu, null);

            $scope.openItems = [];
            $scope.selectedItems = [];
            $scope.selectedFromNavMenu = false;

            $scope.select = function (item) {

                console.info("debug ==> select: ", item);

                // close open nodes
                if (item.open) {
                    item.open = false;
                    return;
                }
                for (var i = $scope.openItems.length - 1; i >= 0; i--) {
                    $scope.openItems[i].open = false;
                }
                ;
                $scope.openItems = [];
                var parentRef = item;
                while (parentRef !== null) {
                    parentRef.open = true;
                    $scope.openItems.push(parentRef);
                    parentRef = parentRef.parent;
                }

                // handle leaf nodes
                if (!item.children || (item.children && item.children.length < 1)) {
                    $scope.selectedFromNavMenu = true;
                    for (var j = $scope.selectedItems.length - 1; j >= 0; j--) {
                        $scope.selectedItems[j].selected = false;
                    }

                    $scope.selectedItems = [];
                    var parentRef = item;
                    while (parentRef !== null) {
                        parentRef.selected = true;
                        $scope.selectedItems.push(parentRef);
                        parentRef = parentRef.parent;
                    }
                }

            }

            $scope.$on('update navigational state', function () {

                var item = $scope.findItemByUrl($scope.menu, '/cm-alarm');
                if (item)
                    $timeout(function () {
                        $scope.select(item);
                    });

            })

            $scope.$watch(function () {
                return $location.path();
            }, function (newVal, oldVal) {
                if ($scope.selectedFromNavMenu == false) {
                    var item = $scope.findItemByUrl($scope.menu, newVal);
                    if (item)
                        $timeout(function () {
                            $scope.select(item);
                        });
                }
                $scope.selectedFromNavMenu = false;
            });

            // searchbar
            $scope.showSearchBar = function ($e) {
                $e.stopPropagation();
                $global.set('showSearchCollapsed', true);
            }
            $scope.$on('globalStyles:changed:showSearchCollapsed', function (event, newVal) {
                $scope.style_showSearchCollapsed = newVal;
            });
            $scope.goToSearch = function () {
                $location.path('/extras-search')
            };
        }])

})();