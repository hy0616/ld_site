
module.exports = {

  attributes: {
    dev_uuid: {
      type: 'string',
      required: true
    },

    alarm_date: {
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

    alarm_name: {
      type: 'string',
      required: true
    },

    content: {
      type: 'json',
      required: true 
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

