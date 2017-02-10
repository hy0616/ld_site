/**
 * Created by hy on 16-6-28.
 */
(function () {
    'use strict'
    angular.module('page.personal', [])
        .controller('personalCtl', ['$scope', 'personSetting', 'DevService', 'AuthService', '$global',
            function ($scope, personSetting, DevService, AuthService, $global) {

                var self = $scope;

                $global.set('rightbarCollapsed', false);
                self.$on('$destroy', function () {
                    $global.set('rightbarCollapsed', true);
                    console.error("关闭 sidebar alarm");
                });

                self.personNav = personSetting.personNav;
                self.navLabel = '个人信息';
                self.switchNumber = function (number) {
                    self.navLabel = number.label;
                }

                var username = AuthService.getUsername();

                DevService.getUserDev().then(function (data) {
                    self.UserDev = data.msg;
                    self.nicknames = data.msg.nickname;
                })

               self.update_nicknames = function(name){
                   var nicknames = {
                       nickname: name
                   }
                   DevService.update_Nickname(nicknames).then(function () {

                       DevService.getUserDev().then(function (data) {
                           self.UserDev = data.msg;
                           alert("保存成功!");
                       })
                   })
               }


                self.updateData = {

                    username: username,
                    password: '',
                    password_new: ''
                }

                self.update_pwd = function () {
                    if (self.updateData.password_new.length < 6) {
                        alert("新密码不能少于6位");
                        return false;
                    } else {
                        DevService.update_pwd(self.updateData).then(function () {

                            if (confirm("密码修改成功,请重新登录!")) {
                                AuthService.logOut();
                            } else {
                                return false;
                            }
                        })
                    }

                }

            }])
})();
