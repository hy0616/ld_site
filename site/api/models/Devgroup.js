/**
* DevGroup.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    name: {
      type: 'string',
      required: true,
      unique: true
    },

    color: {
      type: 'string',
    },

    devcurdatas: {
      collection: 'devcurdata',
      via: "devgroups",
    },

    toJSON: function() {
      var obj = this.toObject();

      delete obj.updatedAt;
      delete obj.createdAt;

      return obj;
    }

  }
};

