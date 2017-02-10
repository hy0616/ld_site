/**
* Componenttree.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    name: {
      type: "string",
      defaultsTo: "theTree"
    },
    content: {
      type: 'array',
      defaultsTo: []
//      required: true

    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.updatedAt;
      delete obj.createdAt;

      return obj;
    }
  }
};

