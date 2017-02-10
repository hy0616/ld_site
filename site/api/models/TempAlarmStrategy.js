/**
 * TempAlarmStrategy.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
var uuid = require('node-uuid');

module.exports = {

  tableName: 'temp_alarm_strategy',

  attributes: {
    strategy_id: {
      type: 'string',
      primaryKey: true,
      index: true,
      defaultsTo: function () {
        return uuid.v4();
      }
    },

    strategy_name: {
      type: 'string'
    },

    username: {
      type: 'string'
    },

    charge_config: {
      type: 'json'
    },

    air_temperature_config: {
      type: 'json'
    },

    air_humidity_config: {
      type: 'json'
    },

    co_ppm_config: {
      type: 'json'
    },

    co2_ppm_config: {
      type: 'json'
    },

    soil_temperature_config: {
      type: 'json',
    },

    soil_humidity_config: {
      type: 'json'
    },

    soil_moisture_config: {
      type: 'json'
    },

    lux_config: {
      type: 'json'
    },

    rain_config: {
      type: 'json'
    },

    windvelocity_config: {
      type: 'json'
    },

    toJSON: function () {
      var obj = this.toObject();

      delete obj.createAt;
      delete obj.updateAt;
      delete obj.id;

      return obj;
    }
  },

  /**
   * get the temp-alarm-strategies
   * @returns {*}
   */
  getTempAlarmStrategy: function (username) {
    return TempAlarmStrategy.find()
      .where({username:username})
      .then(function (strategies) {
        return strategies;
      });
  }
};

