/**
 * Created by shuyi on 15-7-22.
 * @description datetime based on moment.
 */
var moment = require('moment');

var datetime = module.exports;

/**
 * get local time(with utc_offset) timestamp
 * @returns {number} millseconds
 */
datetime.getLocalTimeStamp = function () {
  var date = new Date();
  return date.getTime();
}

/**
 * default use 'YYYY-MM-DD HH:mm:ss' fromat
 * @param displayFormat
 * @returns {*}
 */
datetime.getLocalString = function (displayFormat) {
  var date = new Date();

  if (undefined === displayFormat) {
    return moment(date.getTime()).format('YYYY-MM-DD HH:mm:ss');

  } else {
    return moment(date.getTime()).format(displayFormat);
  }
}

/**
 * use format 'YYYY-MM-DD'
 * @returns {*}
 */
datetime.getLocalDateString = function () {
  var date = new Date();
  return moment(date.getTime()).format('YYYY-MM-DD');
}

/**
 * get the current time with utc timestamp
 * GMT 0 not GMT +0800
 * @returns {number} millseconds
 */
datetime.getUTCTimeStamp = function () {
  var date = new Date();
  return date.getTime() + date.getTimezoneOffset() * 60 * 1000;
}

/**
 * get the current time with utc string,
 * default use 'YYYY-MM-DD HH:mm:ss'
 * @param displayFromat
 * @returns {*}
 */
datetime.getUTCString = function (displayFromat) {
  var date = new Date();
  if (undefined === displayFromat) {
    return moment.utc(date.getTime()).format('YYYY-MM-DD HH:mm:ss');
  } else {
    return moment.utc(date.getTime()).format(displayFromat);
  }
}

/**
 * timezone conversion
 * @param date {Date type}
 * @param tzo {+ -}
 * @param tzn {+ -}
 * @returns {*}
 */
datetime.changeTimezone = function (date, tzo, tzn) {
  tzo = tzo * 60;
  tzn = tzn ? tzn * 60 : -date.getTimezoneOffset();
  date.setTime(date.getTime() - (tzo - tzn) * 60 * 1000);
  return date;
}

/**
 * get the current year
 */
datetime.getCurrentYear = function () {
  return moment().get('year');
}

/**
 * get the current week in this year
 * @returns {*}
 */
datetime.getCUrrentWeek = function () {
  return moment().get('week');
}

/**
 * change the timestamp to utc-time
 * @param timeStamp    millseconds   GMT +0000   getUTCTimeStamp()
 * @return {*}    GMT +0800
 */
datetime.getUTCTimeFromTimeStamp = function (timeStamp) {
  var date = new Date();
  return new Date(timeStamp - date.getTimezoneOffset() * 60 * 1000);
  //return moment(timeStamp - date.getTimezoneOffset() * 60 * 1000);
  //return moment.utc(timeStamp);
}










