/**
* Location.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    address: {
      type: 'string',
    }, 

    country: {
      type: 'string',
    },

    province: {
      type: 'string',
    },

    city: {
      type: 'string',
    },

    city_code: {
      type: 'int',
    },

    district: {
      type: 'string',
    },

    street: {
      type: 'string',
    },

    street_number: {
      type: 'string'
    },

    lat: {
      type: 'float',
      required: true
    },

    lng: {
      type: 'float',
      required: true
    },
/*
    devcurdatas: {
      collection: 'devcurdata',
      via: "location"
    },
*/

    devcurdata: {
      model: 'devcurdata',
    },

    toJSON: function() {
      var obj = this.toObject();

      delete obj.updatedAt;
      delete obj.createdAt;
      delete obj.id;

      return obj;
    }
    
  }
};

