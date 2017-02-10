(function () {
    /* jshint asi:true */
    var translate = {
        "username is empty.": "用户名不能为空.",
        "username format error.": "用户名只能是数字或英文",
        "user not found.": "用户名不存在",
        "password not match.": "密码错误",
        "is aready token.": " 已经存在.",
        "sms code already send": "短信已发送,请注意查收",
        "Send SMS messages beyond the limit of five per day.": "超出验证次数,明天在试试!"
    };

    var authCode = '';//4位验证码字符串
    //验证码随机数组
    var randow = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
        'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z');


    $(".login-form, .register-form").submit(function (e) {
        return false;
    });

    //toastmessage插件弹出信息
    var deleteAlert;
    var alertError = function (msg) {
        if (deleteAlert) {
            $().toastmessage('removeToast', deleteAlert);
        }
        deleteAlert = $().toastmessage('showToast', {position: "top-center", text: msg, type: "error"});
    };
    var alertSuccess = function (msg) {
        if (deleteAlert) {
            $().toastmessage('removeToast', deleteAlert);
        }
        deleteAlert = $().toastmessage('showToast', {position: "top-center", text: msg, type: "success"});
    };

    var alertWarning = function (msg) {
        if (deleteAlert) {
            $().toastmessage('removeToast', deleteAlert);
        }
        deleteAlert = $().toastmessage('showToast', {position: "top-center", text: msg, type: "warning"});
    };

    //手机输入验证
    var checkPhone = function (phone) {
        return phone.length == 11 && is.startWith(phone, "1") && is.not.nan(+phone);
    };

    //用户名输入验证
    var checkUsername = function (username) {
        if (is.empty(username)) {
            alertError('用户名不能为空.');
            return false;
        }

        if (is.not.alphaNumeric(username)) {
            alertWarning('用户名只能是数字或英文.');
            return false;
        }

        return true;
    }

    //密码输入验证
    var checkPwd = function (pwd) {
        if (is.empty(pwd)) {
            alertError('密码不能为空.');
            return false;
        }

        if (pwd.length < 6) {
            alertWarning('密码不能少于6位.');
            return false;
        }

        return true;
    }

    //验证码输入验证
    var checkAuth = function (auth) {
        if (is.empty(auth)) {
            alertWarning('验证码不能为空.');
            authCode = '';
            createCode();
            return false;
        }

        if (auth.toLowerCase() != authCode.toLowerCase()) {
            alertError("请正确输入验证码");
            $(".js-register-authCode").val("");
            authCode = '';
            createCode();
            return false;
        }

        return true;
    }

    //登录按钮事件
    $("#login-button").click(function () {
        var username = $(".username").val();
        var password = $(".password").val();
        var auth = $(".js-register-authCode").val();
        var that = this;

        if (!checkUsername(username)) return false;
        if (!checkPwd(password)) return false;
        if (!checkAuth(auth)) return false;

        $.post("/api/sessions", {username: username, password: password}, function (data) {
            console.log("sessions", data);
            if (data.msg.hasOwnProperty("sessionToken")) {
                //console.log("$.localStorage('key'): ",  $.localStorage('yy:token'));
                $.localStorage('yy.token', data.msg.sessionToken);
                $.localStorage('yy.username', data.msg.username);
                $(that).html("正在登陆 ... ");

                window.location = "/";

            } else {
                alertError(translate[data.msg.message]);
            }
        });
        return false;
    });

    //验证注册信息是否存在
    var usernameExists = false;
    var emailExists = false;
    var phoneExists = false;
    $(".js-register-user").blur(function () {
        if (is.empty($(this).val())) {
            alertError('用户名不能为空.');
            return false;
        }
        if ($(this).val().length < 5) {
            alertWarning("用户名不能少于5位");
            return false;
        }

        var getexists = "/api/users/exists" + "?property=username" + "&username=" + $(this).val();
        $.get(getexists, function (data) {
            if (data.result == "Failed") {
                alertError(data.msg);
                return false;
            }
            if (data.msg == "exist") {
                alertWarning("该用户名已被注册");
                return false;
            }
            usernameExists = true;
        })
    })

    $(".js-register-email").blur(function () {
        var val = $(this).val();
        if (is.empty(val)) {
            emailExists = true;
            return false;
        }
        emailExists = false;
        var getexists = "/api/users/exists" + "?property=email" + "&email=" + $(this).val();
        $.get(getexists, function (data) {

            if (data.result == "Failed") {
                alertError(data.msg);
                return false;
            }
            if (data.msg == "exist") {
                alertWarning("该邮箱已被注册");
                return false;
            }
            if (is.not.email(val)) {
                alertError("邮箱格式错误.");
                return false;
            }
            emailExists = true;
        })

    })

    $(".js-register-phone").blur(function () {
        var val = $(this).val();
        if (is.empty(val)) {
            alertError('手机号不能为空.');
            return false;
        }
        var getexists = "/api/users/exists" + "?property=phone" + "&phone=" + $(this).val();
        $.get(getexists, function (data) {
            if (data.result == "Failed") {
                alertError(data.msg);
                return false;
            }
            if (data.msg == "exist") {
                alertWarning("该手机号已被注册");
                return false;
            }
            if (!checkPhone(val)) {
                alertError("手机号码格式错误.");
                return false;
            }
            phoneExists = true;
        })
    })

    //点击注册按钮事件
    $("#register-btn").click(function () {

        var username = $(".js-register-user").val();
        var password = $(".js-register-passwd").val();
        var password2 = $(".js-register-passwd2").val();
        var phone = $(".js-register-phone").val() || "";
        var email = $(".js-register-email").val() || "";
        var auth = $(".js-register-authCode").val() || "";

        if (!checkUsername(username)) return false;
        if (!checkPwd(password))return false;
        if (is.not.equal(password, password2)) {
            alertError('两次密码不一致.');
            return false;
        }
        if (!checkAuth(auth)) return false;

        var userinfo = {
            username: username,
            password: password,
            password2: password2,
            phone: phone,
            email: email
        };

        if (usernameExists && emailExists && phoneExists) {
            $.post("/api/users", userinfo, function (data) {

                if (data.msg.hasOwnProperty("sessionToken")) {
                    // $.localStorage('yy.token', data.sessionToken);
                    // $.localStorage('yy.username', data.username);

                    $(".register-form").velocity("transition.shrinkOut", {
                        duration: 100, complete: function () {
                            $(".register_return").velocity("transition.shrinkIn", {duration: 200});
                            $(".register_top").css("background", "url(assets/img/registerTop2.jpg) no-repeat 0 0 #f2f2f2");
                            registerTime();
                        }
                    });


                } else {
                    alertError(translate[data.msg.message]);
                }

            });
        } else {
            alertWarning("请完善注册信息");
        }

        return false;
    });

    //密码重置邮箱验证
    $("#email_reset_button").click(function () {

        var input_val = $(".reset-val").val();
        var auth = $(".js-register-authCode").val() || "";

        if (is.empty(input_val)) {
            alertError("您输入为空，我发给谁呢？");
            return false;
        }

        if (is.not.email(input_val)) {
            alertError("邮箱格式错误");
            return false;
        }

        if (!checkAuth(auth)) return false;


        $("#email_reset_button").html("正在处理...");

        var queryStr = "/api/users/emails" + "?email=" + input_val;
        $.get(queryStr, function (data) {
            $("#email_reset_button").html("确认");

            if (data.result == "OK") {
                alertSuccess("确认邮箱已经发送到: " + input_val + ", 请在半小时内修改.");
                setTimeout(function(){
                    window.location = "/";
                }, 3000);

            } else {
                alertError("邮件发送失败: " + data.msg);
            }
        });

        return false;
    });

    //获取手机验证码
    $("#get_smsCode").click(function () {
        var reset_id = $(".reset_id").val();

        if (is.empty(reset_id)) {
            alertError('手机号不能为空.');
            return false;
        }
        if (!checkPhone(reset_id)) {
            alertError("手机号码格式错误.");
            return false;
        }

        var getexists = "/api/users/exists" + "?property=phone" + "&phone=" + reset_id;
        $.get(getexists, function (data) {
            if (data.result == "Failed") {
                alertError(data.msg);
                return false;
            }
            if (data.msg == "exist") {

                $.get("/api/users/smscodes?phone=" + reset_id, function (data) {
                    if (data.result == "OK") {
                        alertSuccess(translate[data.msg]);
                        phoneTime();
                    } else {
                        alertError(data.msg.message);
                    }
                })
            } else{
                alertError("该手机号尚未注册!")
            }
        })

    })

    //密码重置手机验证
    $("#phone_reset_button").click(function () {

        var reset_id = $(".reset_id").val();
        var reset_password = $(".reset_password").val();
        var reset_smsCode = $(".reset_smsCode").val();

        if (is.empty(reset_id)) {
            alertError('手机号不能为空.');
            return false;
        }

        if (!checkPhone(reset_id)) {
            alertError("手机号码格式错误.");
            return false;
        }

        if (!checkPwd(reset_password)) return false;

        if (is.empty(reset_smsCode)) {
            alertError('验证码不能为空.');
            return false;
        }


        var queryStr = {
            phone: reset_id,
            password: reset_password,
            smsCode: reset_smsCode
        }

        $.ajax({
            type: "PUT",
            url: "/api/users/phones/passwords",
            data: queryStr,
            dataType: "json",
            success: function (data) {
                if (data.result == "OK") {
                    goSuccess(data.msg);
                    alertSuccess("修改成功")
                } else {
                    alertError(data.msg);
                }
            },
            error: function (data) {
                console.log(data.msg);
            }
        })

    })


    //点击邮箱验证按钮事件
    $(".switch_email").click(function () {
        $(".reset ul li:nth-child(3)").css("color","#999");
        $(".reset ul li:nth-child(1)").css("color","#ee7218");
        $(".phone_reset").velocity("transition.shrinkOut", {
            duration: 100, complete: function () {
                $(".email_reset").velocity("transition.shrinkIn", {duration: 200});
            }
        });
    });

    //点击手机验证事件
    $(".switch_phone").click(function () {
        $(".reset ul li:nth-child(1)").css("color","#999");
        $(".reset ul li:nth-child(3)").css("color","#ee7218");
        $(".email_reset").velocity("transition.shrinkOut", {
            duration: 100, complete: function () {
                $(".phone_reset").velocity("transition.shrinkIn", {duration: 200});
            }
        });
    });

    //手机 验证成功跳转界面
    var goSuccess = function (data) {

        $(".phone_reset").velocity("transition.shrinkOut", {
            duration: 100, complete: function () {
                $(".retSuccess").velocity("transition.shrinkIn", {duration: 200});
                $(".reset_username").text(data.username);
                $(".reset_phone").text(data.phone);
                $(".reset_email").text(data.email);x
            }
        });
    }

    //验证码
    var createCode = function () {
        for (var i = 0; i < 4; i++) {
            var index = Math.floor(Math.random() * 36);
            authCode += randow[index];
        }
        $('.authCode-style').val(authCode);
    }

    createCode();

    //看不清
    $('#validate').click(function () {
        authCode = '';
        createCode();
    })

    //获取手机验证码倒计时
    var phoneT = 60;
    var phoneTime = function () {
        phoneT -= 1;
        if (phoneT == 0) {
            $("#get_smsCode").removeAttr("disabled");
            $("#get_smsCode").text("获取验证码");
            phoneT = 60;
        } else {
            $("#get_smsCode").attr("disabled", true);
            $("#get_smsCode").text("重新发送(" + phoneT + ")")
            setTimeout(function () {
                phoneTime();
            }, 1000);

        }

    }

    //注册成功返回首页倒计时
    var registerT = 5;
    var registerTime = function () {
        registerT -= 1;
        $(".set_time").text(registerT);
        if (registerT == 0) {
            location.href = '/';
        } else {

            setTimeout(function () {
                registerTime();
            }, 1000);
        }
    }

//正则验证密码强度
    $('.js-register-passwd').keyup(function (e) {
        var strongRegex = new RegExp("^(?=.{8,})(?=.*[a-z])(?=.*[0-9])(?=.*\\W)|(?=.{8,})(?=.*[A-Z])(?=.*[0-9])(?=.*\\W).*$", "g");
        var mediumRegex = new RegExp("^(?=.{7,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$", "g");
        var enoughRegex = new RegExp("(?=.{6,}).*", "g");

        if ($(this).val().length == 0) {
            $('#pwd_validate').fadeOut(1000);
        } else {

            $('#pwd_validate').fadeIn(1000);
        }
        $('#pwd_Strong, #pwd_Medium, #pwd_Weak').removeClass();
        $('#pwd_Strong, #pwd_Medium, #pwd_Weak').addClass("pwd");
        if (strongRegex.test($(this).val())) {
            $('#pwd_Strong, #pwd_Medium, #pwd_Weak').addClass("pwd_Strong_c pwd_Strong_c_r");
            $('#pwd_Medium').text('强');
        } else if (mediumRegex.test($(this).val())) {
            $('#pwd_Medium, #pwd_Weak').addClass("pwd_Medium_c pwd_Medium_c_r");
            $('#pwd_Medium').text('中');
        } else {
            $('#pwd_Weak').addClass("pwd_Weak_c pwd_Weak_c_r");
            $('#pwd_Medium').text('弱');
        }
        return false;
    });

})
();


