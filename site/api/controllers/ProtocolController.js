/**
 * ProtocolController
 *
 * @description :: Server-side logic for managing protocols
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  getAll: function(req, res) {
    Protocol.getAll()
      .spread(function(models) {
//        Protocol.watch(req);
//        Protocol.subscribe(req.socket, models);

        res.json(models);
      })
      .fail(function(err) {
        // An error occured
      });
  },


  checkExsit: function(req, res) {

    var query = {};

    _.isUndefined(req.param('name')) ? query.token = req.param('token'): query.name = req.param('name');

    Protocol.findOne(query).exec(function(err, protocol){
      if (err) {
        sails.log.debug(err);
        return res.json(400, {error:err})
      };

      sails.log.debug("find one exsit: ", protocol);

      if( _.isUndefined(protocol) ){
        return res.json(200, {exsit:false});
      } else {
        return res.json(200, {exsit:true});
      }

    });
  },

  create: function (req, res) {
//    var userId = req.param('user');

    var model = req.body.model;

    console.log("sails create protocol: ", model);

    Protocol.create(model)
      .exec(function(err, protocol) {
        if (err) { res.json(401, {err: err})}
        else {
          res.json(protocol);
        }
      });

//    User.findOne({id: '548bc86c15f1480000eea77e'}).exec(function(err, user){
//
//      var model = {
//        content: req.param('content'),
//        user: user
//      };
//
//      console.log("sails create protocol: ", model);
//
//      Protocol.create(model)
//        .exec(function(err, protocol) {
//          if (err) { res.json(401, {err: err})}
//          else {
//            res.json(protocol);
//          }
//        });
//    })

  }
};

