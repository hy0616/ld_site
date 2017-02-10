/**
* Devanalysis.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    dev_uuid: {
      type: 'string',
      required: true,
    },

    analysis_date: {
      type: 'date',
      required: true,
    },

    dev_timezone: {
      type: 'int',
      required: true
    },

    dev_date: {
      type: 'date',
      required: true
    },

    content: {
      type: 'json',
      required: true,
    },
 
    toJSON: function() {
      var obj = this.toObject();

      delete obj.updatedAt;
      delete obj.createdAt;
      delete obj.id;

      return obj;
    }


  },

};

