/**
 * Created by xieyiming on 15-1-30.
 */


/**
 * Created by xieyiming on 15-1-12.
 */



angular.module('service.util', [

])
  .filter('freq_str', function () {

    return function (freq) {

      var freqInt = parseInt(freq);

      if (freqInt >= 76000 && freqInt <= 108000) {
        return 'fm ' + (parseFloat(freq) / 1000.0).toFixed(2) + ' MHz';
//        return 'fm ' + (parseFloat(freq) / 1000.0).toFixed(1)
      } else {
        return 'am ' + parseInt(freq) + ' KHz';
//        return 'am ' + parseInt(freq)
      }
    };

  })

  .service("UtilService", ["$q", function ($q) {
    var self = this

    var colorPool = {
      0: "rgb(89, 184, 104)",
      1: "rgb(89, 123, 184)",
      2: "rgb(255, 118, 118)",
      3: "rgb(156, 184, 89)",
      4: "rgb(55, 194, 188)",
      5: "rgb(226, 198, 56)",
      6: "rgb(56, 136, 226)",
      7: "rgb(184, 89, 165)",
      8: "rgb(127, 34, 91)",
      9: "rgb(181, 104, 65)"
    }

    self.getColor = function (chnId) {
      return colorPool[chnId]
    }

    self.makePure = function (data) {
      var pureData = {}
      _.forEach(data, function (val, key) {
        pureData[key] = val.val
      })
      return pureData
    }

    self.today = function () {
//      return moment(new Date()).format('YYYY-MM-DD') + " 00:00"
      return moment(new Date()).format('YYYY/MM/DD') + " 00:00"
    }

    self.zhlize = function (datetime) {
      //2015-03-10 00:00
      var date = datetime.split(" ")[0]
      var time = datetime.split(" ")[1]
      var hour = parseInt(time.split(":")[0])
      var minute  = parseInt(time.split(":")[1])
      var hour_unit = "上午"


      if (hour < 9) {
        hour_unit =  "早上";
      } else if (hour < 11 && minute < 30) {
        hour_unit =  "上午";
      } else if (hour < 13 && minute < 30) {
        hour_unit =  "中午";
      } else if (hour < 18) {
        hour_unit =  "下午";
      } else {
        hour_unit =  "晚上";
      }

      return date + " " + hour_unit + hour + "点" + minute
    }

    self.yestoday = function () {
//      return moment(new Date()).add("days", -1).format('YYYY-MM-DD') + " 00:00"
      return moment(new Date()).add("days", -1).format('YYYY/MM/DD') + " 00:00"
    }

    self.tomorrow = function () {
//      return moment(new Date()).add("days", +1).format('YYYY-MM-DD') + " 00:00"
      return moment(new Date()).add("days", +1).format('YYYY/MM/DD') + " 00:00"
    }

    self.weekAgo = function () {
//      return moment(new Date()).add("days", -7).format('YYYY-MM-DD') + " 00:00"
      return moment(new Date()).add("days", -7).format('YYYY/MM/DD') + " 00:00"
    }

    self.monthAgo = function () {
//      return moment(new Date()).add("days", -30).format('YYYY-MM-DD') + " 00:00"
      return moment(new Date()).add("days", -30).format('YYYY/MM/DD') + " 00:00"
    }

    self.todaytitle = function () {
      console.log("todaytitle")
      return moment(new Date()).format('MMMDo')
    }

    self.weektitle = function () {
      return moment(new Date()).add('days', -7).format('MMMDo') + ' -- ' + moment(new Date()).format('MMMDo')
    }

    self.monthtitle = function () {
      return moment(new Date()).add('days', -30).format('MMMDo') + ' -- ' + moment(new Date()).format('MMMDo')
    }

    self.parseDateTime = function (datetimeStr) {
      console.log("parseDateTime inside: ", datetimeStr);

      if (!_.isEmpty(datetimeStr)) {
        var startDate = datetimeStr.split(" ")[0];
        var tmpTime = datetimeStr.split(" ")[1];
        var tmpSplitToken = " ";
        var AMPM = "AM";

        if (tmpTime.startsWith("上午")) {
          tmpSplitToken = "上午";
        } else if (tmpTime.startsWith("早上")) {
          tmpSplitToken = "早上";
        } else if (tmpTime.startsWith("中午")) {
          tmpSplitToken = "中午";
        } else if (tmpTime.startsWith("凌晨")) {
          tmpSplitToken = "凌晨";
        } else if (tmpTime.startsWith("晚上")) {
          AMPM = "PM";
          tmpSplitToken = "晚上";
        } else {
          AMPM = "PM";
          tmpSplitToken = "下午";
        }

        var tmpTimeStr = tmpTime.split(tmpSplitToken)[1].split("点");
        var startTime = tmpTimeStr[0] + ":" + tmpTimeStr[1] + " " + AMPM;

        return startDate + " " + startTime;
      }

    };


  }])