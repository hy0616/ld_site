/**
* Protocol.js
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

    token: {
      type: 'string',
      required: true,
      unique: true
    },

    content: {
      type: 'object',
      required: true
    },

    owner: {
      model: 'user'
    }

  },

  getAll: function() {
    return Protocol.find()
      // TODO: sort by createdAt DESC does not work here, something to do with a camelCase key names bug
//      .sort({createdAt: 'desc'})
      .populate('owner')
      .then(function (models) {
        return [models];
      });
  },

  getOne: function(id) {
    return Protocol.findOne(id)
      .populate('user')
      .then(function (model) {
        return [model];
      });
  }

};

