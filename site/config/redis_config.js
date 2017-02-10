/**
 * Created by shuyi on 15-8-20.
 */

module.exports.redis_config = {

  //redis used to be buffer
  buffer_redis: {
    host: '192.168.1.188',
    port: 6379,
    options:{
      connect_timeout: 1000,    // millseconds
      max_attempts:2
    },

    // pub/sub
    notice_channel_config:{
      server_to_site_channel:'server-to-site-channel',      //used to notice the site
      site_to_server_channel:'site-to-server-channel'       //receive notice from the site
    },
  },

  // same to the receiver/config/redis_config.js
  key_config:{
    userinfos: 'userinfos:',
    smartgateinfos:'smartgateinfos:',
    deviceinfos:'deviceinfos:',
    default_alarm_strategies:'default_as:',
    custom_alarm_strategies:'custom_as:',
    temp_alarm_strategies:'temp_as:',
    events:'events:',
    usersmartgate:'usersmartgate:',
    smartgatedevice:'smartgatedevice:',
    smartgatealarmstrategies:'smartgate_as:',
    deleteddevices:'deleteddevices:',
    userleancloud:'userleancloud:',
    leanclouduser:'leanclouduser:'
  }
}