var _ = require('lodash');
var option = require('./option');

var set_mode_freq = function(record) {
  var ctrl = {};

  ctrl.cmd = 'set_mode_freq';
  ctrl.dev_uuid = record.dev_uuid;
  ctrl.ccp_token = record.content.body.ccp_token;
  ctrl.type = 'component';
  ctrl.params = []; 

  _.forEach(record.content.body.components, function(component) {
    var data = {};

    data.mode = {};
    data.mode.val = component.mode.toLowerCase();
    data.mode.display = 'select';
    data.mode.show_key = 'mode';

    data.freq = {};
    data.freq.val = component.freq;
    data.freq.display = 'text';
    data.freq.verify = 'freq';

    ctrl.params.push(data);
  });

  ctrl.show_keys = {
    mode: ['fm', 'am'],
  };

  ctrl.verify_keys = {
    freq: {
      data_type: 'int',
      min: {bind: 'mode'},
      max: {bind: 'mode'}
    },

    min_fm: 76000,
    min_am: 510,
    max_fm: 108000,
    max_am: 1710

  };

  return ctrl;
}

var set_freq_name = function(record) {
  var ctrl = {};

  ctrl.cmd = 'set_freq_name';
  ctrl.dev_uuid = record.dev_uuid;
  ctrl.ccp_token = record.content.body.ccp_token;
  ctrl.type = 'component';
  ctrl.params = []; 

  _.forEach(record.content.body.components, function(component) {
    var data = {};

    data.mode = {};
    data.mode.val = component.mode.toLowerCase();
    data.mode.display = 'select';
    data.mode.show_key = 'mode';

    data.freq = {};
    data.freq.val = component.freq;
    data.freq.display = 'text';
    data.freq.verify = 'freq';

    data.freq_name = {};
    data.freq_name.val = component.freq_name;
    data.freq_name.display = 'text';
    data.freq_name.verify = 'freq_name';

    ctrl.params.push(data);
  });

  ctrl.show_keys = {
    mode: ['fm', 'am'],
    min_fm: 76000,
    min_am: 510,
    max_fm: 108000,
    max_am: 1710
  };

  ctrl.verify_keys = {
    freq: {
      data_type: 'int',
      min: {bind: 'mode'},
      max: {bind: 'mode'}
    },

    freq_name: option.verify.short_name_len,

  };

  return ctrl;
}


var set_enc_rtmp = function(record) {
  var ctrl = {};

  ctrl.cmd = 'set_enc_rtmp';
  ctrl.dev_uuid = record.dev_uuid;
  ctrl.ccp_token = record.content.body.ccp_token;
  ctrl.type = 'component';
  ctrl.params = []; 

  _.forEach(record.content.body.components, function(component) {
    var data = {};

    data.bitrate = {};
    data.bitrate.val = component.bitrate;
    data.bitrate.display = 'select';
    data.bitrate.show_key = 'bitrate_mp3';

    data.stream_en = {};
    data.stream_en.val = option.trans_pos.enable[record.req_lang][component.stream_en];
    data.stream_en.display = 'select';
    data.stream_en.show_key = 'stream_en';
    data.stream_en.verify = 'enable';

    data.rtmp_addr = {};
    data.rtmp_addr.val = component.rtmp_addr;
    data.rtmp_addr.display = 'text';
    data.rtmp_addr.verify = 'url_len';

    data.rtmp_streamname = {};
    data.rtmp_streamname.val = component.rtmp_streamname;
    data.rtmp_streamname.display = 'text';
    data.rtmp_streamname.verify = 'streamname_len';

    ctrl.params.push(data);
  });

  ctrl.show_keys = {
    bitrate_mp3: [64000, 80000, 96000, 112000, 128000, 160000, 192000],
    stream_en: option.show.enable[record.req_lang],
  };

  ctrl.verify_keys = {
    url_len: option.verify.url_len,
    streamname_len: option.verify.short_name_len,
    enable: option.verify.translate_normal,
  };

  ctrl.translate_alias = _.assign({}, option.trans_neg.enable[record.req_lang]);

  return ctrl;
}


var set_upload_ftp = function(record) {
  var ctrl = {};
  var common = record.content.body.common;

  ctrl.cmd = 'set_upload_ftp';
  ctrl.dev_uuid = record.dev_uuid;
  ctrl.ccp_token = record.content.body.ccp_token;
  ctrl.type = 'common';
  ctrl.params = []; 

  var data = {};

  data.ftp_enable = {};
  data.ftp_enable.val = option.trans_pos.enable[record.req_lang][common.ftp_enable];
  data.ftp_enable.display = 'select';
  data.ftp_enable.show_key = 'enable';
  data.ftp_enable.verify = 'enable';

  data.upload_mode = {};
  data.upload_mode.val = common.ftp_upload_mode;
  data.upload_mode.display = 'select';
  data.upload_mode.show_key = 'upload_mode';

  data.ftp_addr = {};
  data.ftp_addr.val = common.ftp_addr;
  data.ftp_addr.display = 'text';
  data.ftp_addr.verify = 'url_len';

  data.ftp_user = {};
  data.ftp_user.val = common.ftp_user;
  data.ftp_user.display = 'select';
  data.ftp_user.verify = 'user_len';

  data.ftp_password = {};
  data.ftp_password.val = common.ftp_password;
  data.ftp_password.display = 'select';
  data.ftp_password.verify = 'password';

  ctrl.params.push(data);

  ctrl.show_keys = {
    enable: option.show.enable[record.req_lang],
    upload_mode: ['always', 'idle']
  };

  ctrl.verify_keys = {
    url_len: option.verify.url_len,
    user_len: option.verify.user_len,
    password: option.verify.password,
    enable: option.verify.translate_normal,
  };

  ctrl.translate_alias = _.assign({}, option.trans_neg.enable[record.req_lang]);

  return ctrl;
}


var set_devname_region = function(record) {
  var ctrl = {};
  var common = record.content.body.common;

  ctrl.cmd = 'set_devname_region';
  ctrl.dev_uuid = record.dev_uuid;
  ctrl.ccp_token = record.content.body.ccp_token;
  ctrl.type = 'common';
  ctrl.params = []; 

  var data = {};

  data.devname = {};
  data.devname.val = common.devname;
  data.devname.display = 'text';
  data.devname.verify = 'devname';

  data.region = {};
  data.region.val = common.country_region;
  data.region.display = 'select';
  data.region.show_keys = 'region';

  ctrl.params.push(data);

  ctrl.show_keys = {
    region: ['CHINA', 'JAPAN', 'EU', 'USA'],
  };

  ctrl.verify_keys = {
    devname: option.verify.short_name_len,
  };

  return ctrl;
}


var set_utc_offset = function(record) {
  var ctrl = {};
  var common = record.content.body.common;

  ctrl.cmd = 'set_utc_offset';
  ctrl.dev_uuid = record.dev_uuid;
  ctrl.ccp_token = record.content.body.ccp_token;
  ctrl.type = 'common';
  ctrl.params = []; 

  var data = {};

  data.timezone_id = {};
  data.timezone_id.val = common.time_region;
  data.timezone_id.display = 'text';
  data.timezone_id.verify = 'timezone';

  data.utcoffset = {};
  data.utcoffset.val = common.utc_offset;
  data.utcoffset.display = 'text';
  data.utcoffset.verify = 'utcoffset';

  ctrl.params.push(data);

  ctrl.verify_keys = {
    timezone: option.verify.timezone,
    utcoffset: option.verify.utcoffset
  };

  return ctrl;
}


var set_ntp = function(record) {
  var ctrl = {};
  var common = record.content.body.common;

  ctrl.cmd = 'set_ntp';
  ctrl.dev_uuid = record.dev_uuid;
  ctrl.ccp_token = record.content.body.ccp_token;
  ctrl.type = 'common';
  ctrl.params = []; 

  var data = {};

  data.run_mode = {};
  data.run_mode.val = common.time_region;
  data.run_mode.display = 'select';
  data.run_mode.show_keys = 'run_mode';

  data.ntp1 = {};
  data.ntp1.val = common.ntp1;
  data.ntp1.display = 'text';
  data.ntp1.verify = 'url_len';

  data.ntp2 = {};
  data.ntp2.val = common.ntp2;
  data.ntp2.display = 'text';
  data.ntp2.verify = 'url_len';

  data.ntp3 = {};
  data.ntp3.val = common.ntp3;
  data.ntp3.display = 'text';
  data.ntp3.verify = 'url_len';

  data.ntp4 = {};
  data.ntp4.val = common.ntp4;
  data.ntp4.display = 'text';
  data.ntp4.verify = 'url_len';

  ctrl.params.push(data);

  ctrl.show_keys = {
    run_mode: ['only_run', 'save_run'],
  };

  ctrl.verify_keys = {
    url_len: option.verify.url_len,
  };

  return ctrl;
}

var cmdList = [
  'set_mode_freq',
  'set_freq_name',
  'set_enc_rtmp',
  'set_upload_ftp',
  'set_devname_region',
  'set_utc_offset',
  'set_ntp',
  //'upgrade'
];

module.exports = {
  getCmdList: function(record) {
    return cmdList;
  },

  getCmd: function(record, cmdName, lang) {
    if (cmdList.indexOf(cmdName) < 0)
      return null;

    if (lang === undefined)
      record.req_lang = option.lang_default;
    else {
      if (option.lang.indexOf(lang) < 0)
        record.req_lang = option.lang_default;
    }

    return eval(cmdName+'(record)');
  }

};
