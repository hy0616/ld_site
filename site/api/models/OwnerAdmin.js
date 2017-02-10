/**
 * OwnerAdmin.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
var is = require('is_js');

module.exports = {

  tableName: 'owner_admin',

  attributes: {
    owner: {
      type: 'string',
      required: true
    },
    admin: {
      type: 'string',
      required: true
    },
    smartgates: {
      collection: 'smartgate',
      via: 'admin',
      dominant: true
    }
  },

  toJSON: function () {
    var obj = this.toObject();

    delete obj.updatedAt;
    delete obj.createdAt;

    return obj;
  },

  /**
   * check whether the owner-admin has existed
   * @param owner
   * @param admin
   * @return {*}
   */
  checkExist: function (owner, admin) {

    return new Promise(function (resolve, reject) {
      OwnerAdmin.findOne({owner: owner, admin: admin})
        .then(function (ownerAdmin) {
          resolve(is.not.undefined(ownerAdmin));
        })
        .catch(function (err) {
          reject("db error");
        });
    });
  },
};

