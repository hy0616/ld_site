/**
 * Created by shuyi on 15-9-10.
 */
module.exports.errorcode = {
  'E401':{
    code:'401',
    //detail:'must be login.'
    //detail:'请先登录.'
    detail:{
      result:'Failed',
      msg:'请先登录.'
    }
  },


  'E501':{
    code:'501',
    detail:'incomplete parameters.'
  },

  'E502':{
    code:'502',
    detail:'need shed id.'
  },

  'E503':{
    code:'503',
    detail:'need strategy id.'
  },

  'E504':{
    code:'504',
    detail:'can not find this smartgate.'
  },

  'E505':{
    code:'505',
    detail:'need smartgate id.'
  },

  'E506':{
    code:'506',
    detail:'need device id.'
  }
}