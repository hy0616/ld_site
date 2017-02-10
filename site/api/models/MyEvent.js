/**
 * MyEvent.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
var uuid = require('node-uuid');

module.exports = {

  tableName: 'my_event',

  attributes: {
    event_id: {
      type: 'string',
      primaryKey: true,
      index: true,
      defaultsTo: function () {
        return uuid.v4();
      }
    },

    event_name: {
      type: 'string'
    },

    event_type: {
      type: 'string'
    },

    event_level: {
      type: 'string'
    },

    event_date: {
      type: 'date'
    },

    user_name: {
      type: 'string'
    },

    smartgate_sn: {
      type: 'string'
    },

    smartgate_name: {
      type: 'string'
    },

    device_sn: {
      type: 'string'
    },

    event_state: {
      type: 'string'
    },

    detail: {
      type: 'text'
    },

    toJSON: function () {
      var obj = this.toObject();

      delete obj.createAt;
      delete obj.updateAt;
      delete obj.id;

      return obj;
    }
  },

  /**
   * get user's all events between some time quantum
   * @param username
   * @param beginDate
   * @param endDate
   * @param paginate
   * @returns {*}
   */
  getUserEvent: function (username, beginDate, endDate, paginate) {
    if ('' === beginDate && '' === endDate) {
      return MyEvent.find()
        .where({user_name: username})
        .paginate(paginate)
        .then(function (events) {
          return events;
        });
    } else {
      return MyEvent.find()
        .where({user_name: username})
        .where({event_date: {'>=': beginDate, '<=': endDate}})
        .paginate(paginate)
        .then(function (events) {
          return events;
        });
    }

  },

  /**
   * get user's all read events between some time quantum
   * @param username
   * @param beginDate
   * @param endDate
   * @param paginate
   * @return {*}
   */
  getUserReadEvent: function (username, beginDate, endDate, paginate) {
    if ('' === beginDate && '' === endDate) {
      return MyEvent.find()
        .where({user_name: username})
        .where({event_state: 'read'})
        .paginate(paginate)
        .sort({event_date: 'DESC'})
        .then(function (events) {
          return events;
        });
    } else {
      return MyEvent.find()
        .where({user_name: username})
        .where({event_state: 'read'})
        .where({event_date: {'>=': beginDate, '<=': endDate}})
        .paginate(paginate)
        .sort({event_date: 'DESC'})
        .then(function (events) {
          return events;
        });
    }
  },

  /**
   * get user's all unread events between some time quantum
   * @param username
   * @param beginDate
   * @param endDate
   * @param paginate
   * @return {*}
   */
  getUserUnReadEvent: function (username, beginDate, endDate, paginate) {
    if ('' === beginDate && '' === endDate) {
      return MyEvent.find()
        .where({user_name: username})
        .where({event_state: 'unread'})
        .paginate(paginate)
        .sort({event_date: 'DESC'})
        .then(function (events) {
          return events;
        })
    } else {
      return MyEvent.find()
        .where({user_name: username})
        .where({event_state: 'unread'})
        .where({event_date: {'>=': beginDate, '<=': endDate}})
        .paginate(paginate)
        .sort({event_date: 'DESC'})
        .then(function (events) {
          return events;
        })
    }
  },

  /**
   * get the record number
   * @param username
   * @param eventState
   * @param beginDate
   * @param endDate
   * @return {*}
   */
  getRecordCount: function (username, eventState, beginDate, endDate) {
    if ('' === beginDate && '' === endDate) {
      //return MyEvent.count({username:username,event_state:eventState})
      return MyEvent.count()
        .where({user_name: username})
        .where({event_state: eventState})
        .then(function (count) {
          return count;
        })
    } else {
      return MyEvent.count()
        .where({user_name: username})
        .where({event_state: eventState})
        .where({event_date: {'>=': beginDate, '<=': endDate}})
        .then(function (count) {
          return count;
        })
    }


    /*if('' === beginDate && '' === endDate){
     //return MyEvent.count({username:username,event_state:eventState})
     return MyEvent.count({username:username,event_state:eventState})
     .then(function (count) {
     return count;
     })
     }else{
     return MyEvent.count({username:username,event_state:eventState,event_date: {'>=': beginDate, '<=':endDate}})
     .then(function (count) {
     return count;
     })
     }*/

  }

};
