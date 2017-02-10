var _ = require('lodash');

var set_erelay_switch = function(record) {
  var ctrl = {};

  ctrl.cmd = 'set_erelay_switch';
  ctrl.dev_uuid = record.dev_uuid;
  ctrl.ccp_token = record.content.body.ccp_token;
  ctrl.type = 'component';
  ctrl.params = []; 

  var component_ids = [];
  _.forEach(record.content.body.components, function(component) {
    var data = {};

    if (_.has(component, 'status')) {
      component_ids.push(component.component_id);

      data.component_id = {};
      data.component_id.val = component.component_id;
      data.component_id.display = 'select';
      data.component_id.show_key = 'component_ids';

      data.status = {};
      data.status.val = component.status;
      data.status.display = 'select';
      data.status.show_key = 'status';

      ctrl.params.push(data);
    }

  });

  ctrl.show_keys = {
    component_ids: component_ids,
    status: [0, 1],
  };

  return ctrl;
}

var cmdList = [
  'set_erelay_switch',       // single relay, like water-valve
  'set_erelay2_switch'      //double-relay,like rolling-machine
];

module.exports = {
  getCmdList: function(record) {
    return cmdList;
  },

  getCmd: function(record, cmdName) {
    if (cmdList.indexOf(cmdName) < 0)
      return null;

    return eval(cmdName+'(record)');
  }

};

