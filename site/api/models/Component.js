/**
* Component.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    token: {
      type: 'string',
      required: true,
      unique: true
    },

    group: {
      type: 'string',
      required: true
    },

    label: {
      type: 'string',
      unique: true
    },

    content: {
      type: 'object'
    }
  },

  getOne: function(id) {
    return Component.findOne(id)
      .then(function (model) {
        return [model];
      });
  }


};

