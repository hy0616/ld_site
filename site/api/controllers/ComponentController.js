/**
 * ComponentController
 *
 * @description :: Server-side logic for managing components
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  getOne: function(req, res) {
    var query = {};

    if (_.isUndefined( req.param('token') )){
      query.label = req.param('label');
    } else {
      query.token = req.param('token');
    }

    if(_.isEmpty(query)){
      return res.json(400, {error: "arg error"});
    };

    Component.findOne(query).exec(function(err, component){
      if (err) {
        sails.log.debug("component error: ", err);
        return res.json(401, {error: "db error"})
      };
      sails.log.debug("getOne: ", component);

      if(_.isUndefined(component)){
        return res.json(200, component);
      }
      return res.json(200, component.content);
    })
  },

  create: function(req, res) {

    var model = {
      token : req.body.token,
      group : req.body.group,
      label : req.body.label,
      content :req.body.content
    }

    Component.create(model).exec(function(err, component){
      if (err) {
        sails.log.debug("component error: ", err);
        return res.json(401, {error: "create component error"})
      };

      return res.json(200, component);
    });
  },

  delete: function(req, res) {
    var name = req.param('name') || "";

    sails.log.debug("sails delete: ", name);

    Component.destroy({label: name}).exec(function(err, component){
      if (err) {
        sails.log.debug(err);
        return res.json(401, {error:err})
      };

      return res.json(200, component);
    });

  },

  checkExsit: function(req, res) {
    var name = req.param('name') || "";

    Component.findOneByLabel(name).exec(function(err, label){
      if (err) {
        sails.log.debug(err);
        return res.json(400, {error:err})
      };

      sails.log.debug("find one exsit: ", label);

      if( _.isUndefined(label) ){
        return res.json(200, {exsit:false});
      } else {
        return res.json(200, {exsit:true});
      }

    });
  }
};

