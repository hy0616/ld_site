/**
 * SmartGateData.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  tableName: 'smartgate_data',

  attributes: {
    sn: {
      type: 'string',
      required: true,
      index: true
    },

    air_temperature: {
      type: 'float'
    },

    air_humidity: {
      type: 'float'
    },

    soil_temperature: {
      type: 'float'
    },

    soil_humidity: {
      type: 'float'
    },

    co_ppm: {
      type: 'float'
    },

    co2_ppm: {
      type: 'float'
    },

    lux: {
      type: 'float'
    },

    update_date: {
      type: 'date'
    },

    toJSON: function () {
      var obj = this.toObject();

      delete obj.updatedAt;
      delete obj.createdAt;
      delete obj.id;

      return obj;
    }
  }
};

