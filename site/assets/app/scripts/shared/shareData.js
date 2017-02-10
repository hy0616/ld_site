/**
 * Created by hy on 16-6-28.
 */

(function () {
    'use strict'
    angular.module('shareData', [])
        .factory('personSetting', [function () {
            return {
                personNav: [
                    {
                        label: '个人信息',
                        img: '../assets/img/person.png'
                    },
                    {
                        label: '修改密码',
                        img: '../assets/img/update_pwd.png',
                    }
                ]
            }
        }])
})();