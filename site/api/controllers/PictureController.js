var moment = require('moment');

module.exports = {
  getList: function(req, res) {
    var limit = ParamService.getPageLimit(req); 
    var page  = ParamService.getPageNum(req); 
    var startDate = new Date(req.param('start_date'));

    var dev_uuid = req.param('dev_uuid');
    var component_id = req.param('component_id');

    Picture.find({dev_uuid: dev_uuid})
    .where({dev_date: { '>=': startDate}})
    .paginate({page: page, limit: limit})
    .sort({dev_date: 'desc'})
    .then(function(records) {
      var result = [];
      _.forEach(records, function(record) {
        var data = {};
        data.dev_uuid = record.dev_uuid;
        data.component_id = record.component_id;
        data.url = record.url;
        data.date = moment(record.dev_date.getTime()).format('YYYY-MM-DD HH:mm:ss');

        result.push(data);
      });

      res.json(200, result);
    });

  },


}
