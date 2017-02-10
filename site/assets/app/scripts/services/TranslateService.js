/**
 * Created by xieyiming on 15-2-11.
 */

angular.module('service.translate', [

])

  .service("TranslateService", function () {
      var self = this

      self.get = function(lang) {
        if(lang == 'zh') {
          return {
            "SET_MODE_FREQ":"模式频率",
            "SET_FREQ_NAME":"频率别名",
            "SET_ENC_RTMP":"流媒体",
            "SET_UPLOAD_FTP":"FTP上传",
            "SET_DEVNAME_REGION":"设备区域信息",
            "SET_UTC_OFFSET":"时区设置",
            "SET_NTP":"NTP服务器",
            "UPGRADE":"远程升级",

            "TIME_BEGAIN": "开始",
            "TIME_END": "结束",
            "CANCLE": "取消",
            "CONFIRM": "确定",
            "DEV_LIST": "设备列表",
            "FREQ_LIST":"频率列表",
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
            "CHN_SUMMARY": "监测概况",
            "CHN_TOTAL_CNT": "频道总数",
            "ONLINE": "在线",
            "OFFLINE": "离线",
            "LOGO_TITLE": "Radiostreamer监测云",
            "CTRL_SWITCH":"设备列表"
          }
        }
        if(lang == 'en'){
          return {
            "SET_MODE_FREQ":"SET_MODE_FREQ",
            "TIME_BEGAIN": "Begin",
            "TIME_END": "End",
            "CANCLE": "Cancle",
            "CONFIRM": "Confirm",
            "DEV_LIST": "Dev List",
            "FREQ_LIST":"Freq List",
            "ANALYSIS_TITLE": "Analysis",
            "CUSTOM": "custom",
            "SNR": "Snr",
            "RSSI": "Rssi",
            "CORR": "Corr",
            "TODAY": "today",
            "WEEK": "week",
            "MONTH": "month",
            "DEV_NAME": "Dev Name",
            "CHANNEL": "Chn",
            "CHN_SUMMARY": "Chn Summary",
            "CHN_TOTAL_CNT": "Total",
            "ONLINE": "online",
            "OFFLINE": "offline",
            "LOGO_TITLE": "Radiostreamer Monitor",
            "CTRL_SWITCH":"Dev List"
          }
        }
      }

    })


