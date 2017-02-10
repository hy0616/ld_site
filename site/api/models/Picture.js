module.exports = {

  attributes: {
    dev_uuid: {
      type: 'string',
      required: true
    },

    component_id: {
      type: 'int',
      required: true
    },

    save_date: {
      type: 'date',
      required: true
    },

    dev_timezone: {
      type: 'int',
      required: true
    },

    dev_date: {
      type: 'date',
      required: true
    },

    url: {
      type: 'string',
      required: true
    },


    toJSON: function() {
      var obj = this.toObject();

      delete obj.updatedAt;
      delete obj.createdAt;
      delete obj.id;

      return obj;
    }




  }

}
