/**
 * SoilTHData.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  tableName: 'soil_th_data',

  attributes: {
    sn: {
      type: 'string',
      required: true,
      index: true
    },

    device_type: {
      type: 'string'
    },

    temperature: {
      type: 'float'
    },

    humidity: {
      type: 'float'
    },

    //server time
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

