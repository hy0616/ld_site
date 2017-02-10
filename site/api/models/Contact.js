
module.exports = {

  attributes: {

    name: {
      type: 'string',
    },

    phone: {
      type: 'string',
      unique: true
    },

    owner: {
      model: 'user'
    },

    toJSON: function() {
      var obj = this.toObject();

      delete obj.updatedAt;
      delete obj.createdAt;
      delete obj.id;

      return obj;
    }

  },



}
