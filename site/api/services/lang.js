
var table = {
  'online_offline': {
    'zh': '上下线',
  },

  'online' : {
    'zh': '设备上线',
  }, 

  'offline': {
    'zh': '设备下线', 
  },

  'chn': {
    'zh': '通道',
  },

  'alarm': {
    'zh': '报警',
  },
   
  'alarm_level': {
    'zh': '报警级别',
  },

  'is': {
    'zh': '为',
  },

  'freq': {
    'zh': '频率',
  },

};


module.exports = {
  getLangString: function(region, key) {
    return table[key][region];
  },
};
