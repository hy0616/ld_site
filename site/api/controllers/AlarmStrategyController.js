/**
 * AlarmStrategyController
 *
 * @description :: Server-side logic for managing Alarmstrategies
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require('bluebird');
var _ = require('lodash');

module.exports = {
  getDefaultAlarmStrategies: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          DefaultAlarmStrategy.getAll()
            .then(function (models) {
              res.json(models);
            });
        }
      });
  },

  /**
   * get the customer-alarm-strategy
   * @param req
   * @param res
   */
  getCustomAlarmStrategies: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          //console.log(username);
          CustomerAlarmStrategy.getCustomAlarmStrategy(username)
            .then(function (models) {
              res.json(models);
            });
        }
      });
  },

  /**
   * add a custom-alarm-strategy
   * @param req   alarm_strategy
   * @param res
   */
  addCustomAlarmStrategy: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          var obj = parseToString(req.body.alarm_strategy);

          //var newStrategy = JSON.parse(req.body.alarm_strategy);
          var newStrategy = JSON.parse(obj);
          newStrategy = _.omit(newStrategy, 'strategy_id');
          newStrategy.username = username;
          AlarmStrategyService.addCustomAlarmStrategy(newStrategy)
            .then(function (result) {
              res.json('200', result);
            });
        }
      });
  },

  /**
   * update a special custom-alarm-strategy
   * @param req   alarm_strategy
   * @param res
   */
  updateCustomAlarmStrategy: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else if (null === req.params['id']) {
          res.json(sails.config.errorcode.E503.code, sails.config.errorcode.E503.detail);
        } else {
          var obj = parseToString(req.body.alarm_strategy);
          var newStrategy = JSON.parse(obj);
          newStrategy.username = username;
          AlarmStrategyService.updateCustomAlarmStrategy(newStrategy)
            .then(function (result) {
              res.json('200', result);
            });
        }
      });
  },

  /**
   * delete a special custom-alarm-strategy
   * @param req   strategy_id
   * @param res
   */
  deleteCustomAlarmStrategy: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else if (null === req.params['id']) {
          res.json(sails.config.errorcode.E503.code, sails.config.errorcode.E503.detail);
        } else {
          var strategyId = req.params['id'];
          AlarmStrategyService.deleteCustomAlarmStrategy(strategyId)
            .then(function (result) {

              /*var result = {
               result:'OK/Failed',
               usingShed: [],
               msg:''
               }*/

              res.json('200', result);
              /*res.json('200', {'result': result});*/
            });
        }
      });
  },

  /**
   * get the user's temp-alarm-strategy
   * not used
   * @param req
   * @param res
   */
  getTempAlarmStrategies: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          TempAlarmStrategy.getTempAlarmStrategy(username)
            .then(function (models) {
              res.json(models);
            });
        }
      });
  },

  /**
   * get the shed's alarm-strategy
   * @param req
   * @param res
   */
  getShedAlarmStrategy: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else if (null === req.params['shedId']) {
          res.json(sails.config.errorcode.E502.code, sails.config.errorcode.E502.detail);
        } else {
          var shedId = req.params['shedId'];

          AlarmStrategyService.getShedAlarmStrategy(shedId)
            .then(function (result) {
              res.json('200', result);
            });
        }
      });
  },

  /**
   * assign a alarm-strategy to a shed
   * @param req strategy_type,strategy_id,strategy
   * @param res
   */
  assignShedAlarmStrategy: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else if (null === req.params['shedId']) {
          res.json(sails.config.errorcode.E502.code, sails.config.errorcode.E502.detail);
        } else {
          var obj = parseToString(req.body.alarm_strategy);
          var metaData = {
            shed_id: req.params['shedId'],
            strategy_type: req.body.strategy_type,
            strategy_id: req.body.strategy_id,
            username: username,
            strategy: obj === undefined ? undefined : JSON.parse(obj)
          };

          AlarmStrategyService.assignShedAlarmStrategy(metaData)
            .then(function (result) {
              res.json('200', {'result': result});
            });
        }
      });
  },

  /**
   * delete the shed's alarm-strategy
   * @param req
   * @param res
   */
  deleteShedAlarmStrategy: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else if (null === req.params['shedId']) {
          res.json(sails.config.errorcode.E502.code, sails.config.errorcode.E502.detail);
        } else {
          var shedId = req.params['shedId'];

          AlarmStrategyService.deleteShedAlarmStrategy(shedId)
            .then(function (result) {
              res.json('200', {'result': result});
            });
        }
      });
  }

};

/**
 * parse the oldValue to String
 * @param oldValue
 * @return {*}
 */
function parseToString(oldValue){
  var returnValue;
  if(typeof(oldValue) === 'object'){
    returnValue = JSON.stringify(oldValue);
  }else{
    returnValue = oldValue;
  }
  return returnValue;
}

