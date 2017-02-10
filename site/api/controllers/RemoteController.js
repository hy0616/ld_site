var _ = require('lodash');
var WebCmd = require('../cmd/webcmd');
var rs200Cmd = require('../cmd/rs200cmd');
var yydev1Cmd = require('../cmd/smartgatecmd');
var _ = require('lodash'),
  Promise = require('bluebird');


module.exports = {
  getCmdList: function (req, res) {
    DevCurData.getCurInfo(req)
      .then(function (record) {
        eval('var cmdList = ' + record.dev_type + 'Cmd.getCmdList(record)');
        res.json(cmdList);
      })
  },

  getCmd: function (req, res) {
    DevCurData.getCurInfo(req)
      .then(function (record) {
        eval("var cmd = " + record.dev_type + "Cmd.getCmd(record, req.param('cmd_name'), req.param('lang'))");
        res.json(cmd);
      })
  },

  doCmd: function (req, res) {
    var result = {};
    result.result = 'Failed';

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(401, {err: '请先登录'});
        } else {
          var smartGateSn = req.param("smartgate_sn");
          if (null === smartGateSn || undefined === smartGateSn) {
            result.msg = '不合法的主机';
            res.json(200, result);
            return;
          }

          //1.check whether is admin
          OwnerAdmin.findOne({admin: username}).populate('smartgates', {sn: smartGateSn})
            .then(function (ownerAdmin) {
              //does not belong to some admin
              if (null === ownerAdmin || undefined === ownerAdmin || undefined === ownerAdmin.smartgates || (ownerAdmin.smartgates.length === 0)) {
                //2.check whether is owner
                SmartGate.findOne()
                  .where({sn: smartGateSn, owner: username})
                  .then(function (smartgate) {
                    if (null === smartgate || undefined === smartgate) {
                      result.msg = '您没有控制权限';
                      res.json(200, result);
                      return;
                    } else {
                      doCmd(req,res);
                    }
                  })
              } else {
                doCmd(req,res);
              }
            })
        }
      });
  },

  /**
   * multi control
   * @param req
   * @param res
   */
  doMultiCmd: function (req, res) {
    var result = {};
    result.result = 'Failed';

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(401, {err: '请先登录'});
        } else {
          var smartGateSn = req.param("smartgate_sn");
          if (null === smartGateSn || undefined === smartGateSn) {
            result.msg = '不合法的主机';
            res.json(200, result);
            return;
          }

          //1.check whether is admin
          OwnerAdmin.findOne({admin: username}).populate('smartgates', {sn: smartGateSn})
            .then(function (ownerAdmin) {
              //does not belong to some admin
              if (null === ownerAdmin || undefined === ownerAdmin || undefined === ownerAdmin.smartgates || (ownerAdmin.smartgates.length === 0)) {
                //2.check whether is owner
                SmartGate.findOne()
                  .where({sn: smartGateSn, owner: username})
                  .then(function (smartgate) {
                    if (null === smartgate || undefined === smartgate) {
                      result.msg = '您没有控制权限';
                      res.json(200, result);
                      return;
                    } else {
                      doMultiCmd(req,res);
                    }
                  })
              } else {
                doMultiCmd(req,res);
              }
            })
        }
      });
  }

};

function doCmd(req, res) {
  var webCmd = new WebCmd();
  var result = {};
  result.result = 'Failed';

  webCmd.doCmd(req.param("ccp_token"), req.param("smartgate_sn"), req.param("params"), req.param("rt_info"));

  webCmd.on('data', function (data) {
    var realData = JSON.parse(data);
    if (realData.type == 'response') {
      result.msg = realData.ret;
      result.result = realData.result;
      res.json(200,result);
    } else if (realData.type == 'data') {
      var rtData = realData.data;
      result.msg = rtData;
      req.socket.emit('rtdata', JSON.stringify(rtData));
      res.json(200,result);
    }
  });

  webCmd.on('error', function (data) {
    result.msg = 'connect cmd server fail';
    res.json(200, result);
  });
}

/**
 * multi control
 * @param req
 * @param res
 */
function doMultiCmd(req, res){

  var result = {};
  result.result = 'Failed';
  var isServerError = false;

  var cmdArrayStr = req.body.cmds;
  if(null === cmdArrayStr || undefined === cmdArrayStr){
    result.msg = '请选择需要控制的设备';
    res.json(200, result);
    return;
  }

  var cmdArray = JSON.parse(req.body.cmds);

  Promise.map(cmdArray, function (cmd) {
    return new Promise(function (resolve, reject) {
      var webCmd = new WebCmd();
      var singleResult = {};
      singleResult.result = 'Failed';
      try{
        webCmd.doCmd(req.param("ccp_token"), req.param("smartgate_sn"), cmd, req.param("rt_info"));

        singleResult.sn = cmd.sn;

        webCmd.on('data', function (data) {

          var realData = JSON.parse(data);
          if (realData.type == 'response') {
            singleResult.result = realData.result;
            singleResult.msg = realData.ret;
            resolve(singleResult);
          } else if (realData.type == 'data') {
            var rtData = realData.data;
            req.socket.emit('rtdata', JSON.stringify(rtData));
            singleResult.msg = rtData;
            resolve(singleResult);
          }
        });

        webCmd.on('error', function (data) {
          isServerError = true;
          singleResult.msg = '与服务器连接失败';
        });
      }catch(e){
        resolve(singleResult);
      }
    })
  })
    .then(function (singleResults) {
      if(!isServerError){
        result.result = 'OK';
      }
      result.msg = singleResults;
      res.json(200, result);
    });
}


