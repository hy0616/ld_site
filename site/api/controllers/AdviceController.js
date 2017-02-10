module.exports = {
  index: function(req, res) {
    Advice.find()
    .then(function(result) {
      res.json(result);
    });
  },

  create: function(req, res) {
    var result = {};
    result.result = 'Failed';
    Advice.create({advice: req.body.advice})
    .then(function(record) {
      if (record != undefined) {
        result.result = 'OK';
        result.msg = '提交成功！';
        res.json(200, result);
      }else{
        result.msg = '提交失败，服务器发生错误.';
        res.json(200,result);
      }
    });

  },
}
