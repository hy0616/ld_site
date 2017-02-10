/**
 * Created by shuyi on 16-1-27.
 */

//Same to the receiver/config/event_config/event_config.js
module.exports.event_description_config = {
  event_name_config: {
    SMARTGATE_ONLINE: 'smartgate-online',
    SMARTGATE_OFFLINE: 'smartgate-offline',
    DEVICE_ONLINE: 'device-online',
    DEVICE_OFFLINE: 'device-offline',
    CHARGE_ALARM: 'charge-alarm',
    AIR_TEMPERATURE_ALARM: 'air-temperature-alarm',
    AIR_HUMIDITY_ALARM: 'air-humidity-alarm',
    SOIL_TEMPERATURE_ALARM: 'soil-temperature-alarm',
    SOIL_HUMIDITY_ALARM: 'soil-humidity-alarm',
    CO_PPM_ALARM: 'co-ppm-alarm',
    CO2_PPM_ALARM: 'co2-ppm-alarm',
    LUX_ALARM: 'lux-alarm'
  },

  event_type_config: {
    NOTICE: 'notice',
    ALARM: 'alarm'
  },

  event_level_config: {
    NOTICE: {
      NOTICE_LEVEL_1: 'notice-level-1',
      NOTICE_LEVEL_2: 'notice-level-2'
    },

    ALARM: {
      ALARM_LEVEL_1: 'alarm-level-1',
      ALARM_LEVEL_2: 'alarm-level-2',
      ALARM_LEVEL_3: 'alarm-level-3'
    }
  },

  event_state: {
    READ: 'read',
    UNREAD: 'unread'
  }
}