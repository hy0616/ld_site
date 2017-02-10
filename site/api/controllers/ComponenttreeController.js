/**
 * ComponenttreeController
 *
 * @description :: Server-side logic for managing componenttrees
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  update: function(req, res) {
    var treeData = req.body.treeData;

    _(treeData).map(function(el){
      delete el.$$hashKey;
      _(el.children).map(function(subel){
        delete subel.$$hashKey;
      })
    });

    sails.log.info("updateTree action treeData: ", treeData);

    Componenttree.findOrCreate({name: 'theTree'},{name:'theTree'})
      .exec(function(err, model){
        if (err) {
          sails.log.debug(err);
          return res.json(401, {error:err})
        };
        _(treeData).forEach(function(el){
          console.log("fuck: el final: ", el);
        });
        model.content = treeData;

        model.save(function(err, ret){
          if (err) {
            sails.log.debug(err);
            return res.json(401, {error:err})
          };
          return res.json(200, ret);
        })
      })
  },

  getOne: function(req, res){
//      var treeData = [
//        {
//          children: [
//            {
//              label: "child1"
//            },
//
//            {
//              label: "child2"
//            }
//          ],
//          label: "radiostreamer",
//          group_id : "fjei"
//        },
//
//        {
//          children: [
//            {
//              label: "C-b"
//            },
//
//            {
//              label: "C-c"
//            }
//          ],
//          label: "aipservice"
//        }
//      ];

    Componenttree.findOneByName("theTree").exec(function(err, model){

      if (err) {
        sails.log.debug(err);
        return res.json(401, {error:err})
      };

      if(_.isUndefined(model)){
        return res.json(200,[]);
      }
      return res.json(200, model.content);
    })


  }

};

