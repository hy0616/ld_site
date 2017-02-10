module.exports = {
  lang: ['zh', 'en'],
  lang_default: 'zh',

  show: {
    enable: {
      zh: ['关闭', '打开'],
      en: ['disable', 'enable']
    }
  },

  trans_pos: {
    enable: {
      zh: {
        0: '关闭',
        1: '打开'
      },

      en: {
        0: 'disable',
        1: 'enable'
      }
    },
  },

  trans_neg: {
    enable: {
      zh: {
        '关闭': 0,
        '打开': 1
      },

      en: {
        'disable': 0,
        'enable': 1
      },
    },
  },

  verify: {
    url_len: {
      data_type: 'string',
      min: 0,
      max: 128 
    },

    short_name_len: {
      data_type: 'string',
      min: 0,
      max: 32
    },

    user_len: {
      data_type: 'string',
      min: 0,
      max: 32
    },

    password: {
      data_type: 'string',
      min: 0,
      max: 32
    },

    timezone: {
      data_type: 'int',
      min: 0,
      max: 75
    },

    utcoffset: {
      data_type: 'int',
      min: -43200,
      max: 46800
    },

    translate_normal: {
      translate_alias: true
    }


  },
};
