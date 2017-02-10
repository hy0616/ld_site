/**
 * LocationController
 *
 * @description :: Server-side logic for managing locations
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  aaa: function (req, res) {
    Location.find().populate('devcurdata').then(function (bb) {
      console.log(JSON.stringify(bb, null, 2).toString());
      return res.json(bb);
    });
  },


  create: function (req, res) {
    var lat = req.param('lat');
    var lon = req.param('lon');
    var dev_uuid = req.param('dev_uuid');

    DevCurData.findOne().where({dev_uuid: dev_uuid})
      .then(function (dev) {
        Location.create({lat: lat, lon: lon, devcurdatas: dev.id}, function (err, location) {
          return res.json(200, {dev_uuid: dev_uuid, location: location});
        });
      });
  },

  getCoorByIp: function(req, res) {
//    var ip = req.param('ip')
    //var ip = "171.216.73.21"
    var ip = "171.216.95.137"
    //var ip = "127.0.0.1"
    //var ip = "127.344.768.1"
    //var ip = "0.0.0.0"

    BaiduMapService.getCoorByIp(ip).then(function(data){
      console.log("getCoorByIp: ", data)
      return res.json(200, data)
    }).catch(function(error){
      return res.json(400, error)
    })

  },

  getAddressByCoor: function(req, res) {
//    var lat = 30.6799428
//    var lng = 104.0679234

    var lat = req.param('lat')
    var lng = req.param('lng')

    BaiduMapService.getAddressByCoor(lat, lng).then(function(data){
//      console.log("getAddressByCoor: ", data)
      return res.json(200, data)
    }).catch(function(error){
      return res.json(400, error)
    })
  }

};

