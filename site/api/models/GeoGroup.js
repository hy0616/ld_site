/**
* GeoGroup.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var uuid = require('node-uuid');

module.exports = {

  tableName:'geogroup',

  attributes: {
    geogroup_id: {
      type: 'string',
      primaryKey: true,
      index: true,
      defaultsTo: function () {
        return uuid.v4();
      }
    },

    country: {
      type: 'string'
    },

    province: {
      type: 'string'
    },

    city: {
      type: 'string'
    },

    district: {
      type: 'string'
    },

    lat:{
      type:'float'
    },

    lng:{
      type:'float'
    },

    smartgates: {
      collection: 'smartgate',
      via: 'geogroup'
    },

    toJSON: function () {
      var obj = this.toObject();

      delete obj.createAt;
      delete obj.updateAt;
      delete obj.id;

      return obj;
    }
  }
};

