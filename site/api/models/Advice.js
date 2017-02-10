module.exports = {
  attributes: {

    advice: {
      type: 'string',
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
