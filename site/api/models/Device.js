/**
 * Device.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

Promise = require('bluebird');

module.exports = {

  tableName: 'device',

  attributes: {
    sn: {
      type: 'string',
      required: true,
      primaryKey: true,
      index: true
    },
    // smartgate which owns the device
    owner: {
      model: 'smartgate'
    },
    dev_name: {
      type: 'string'
    },
    dev_alias: {
      type: 'string'
    },
    dev_type: {
      type: 'string'
    },
    // when dev_type is erelay or erelay2, needs dev_extend_type to know what the device is, like rolling-maching, sluice valve or something else.
    dev_extend_type: {
      type: 'string'
    },
    // camera user
    user: {
      type: 'string'
    },
    // camera password
    password: {
      type: 'string'
    },

    toJSON: function () {
      var obj = this.toObject();

      delete obj.updatedAt;
      delete obj.createdAt;

      return obj;
    }
  },

  /**
   * get some device's owner
   * @param deviceSn
   */
  getOwner: function (deviceSn) {
    return new Promise(function (resolve, reject) {
      Device.findOne()
        .where({sn: deviceSn})
        .then(function (model) {
          if (null === model || undefined === model)
            resolve(undefined);
          else
            resolve(model['owner']);
        })
    })
  }

};

