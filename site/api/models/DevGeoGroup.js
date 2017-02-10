module.exports = {
  attributes: {

    name: {
      type: 'string',
      required: true,
      unique: true,
      index: true
    },

    parent_name: {
      type: 'string',
    },

    scope: {
      type: 'string',
    },

    devcurdatas: {
      collection: 'devcurdata',
      via: "devgeogroups",
    },

    toJSON: function() {
      var obj = this.toObject();

      delete obj.updatedAt;
      delete obj.createdAt;

      return obj;
    }

  }
};

