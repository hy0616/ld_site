/**
 * Created by xieyiming on 14-12-4.
 */

module.exports.nodemailer = {
//  usessl: true,
  port: 465,
  from: 'linkdotter-service@linkdotter.com',
  host: 'smtp.mxhichina.com',
  user: "linkdotter-service@linkdotter.com",
  pass: "LDservice@2016",

  prepend_subject: "密码重置邮件."
};

