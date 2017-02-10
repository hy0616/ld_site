var _ = require('lodash');
var Promise = require('bluebird');

var _countModel = function(model, limit, populateModel, Criteria) {
  return new Promise(function(resolve) {
    var keys = _.keys(Criteria);
    var cnt = 0;

    model.count(function(err, num) {
      var pages = Math.ceil(num/limit); 
      var indexArray = _.range(0, pages);
      //console.log(indexArray);

      async.each(indexArray, function(i, cb) {
          model.find()
          .paginate({page: i, limit: limit})
          .populate(populateModel)
          .then(function(records) {
            _.forEach(records, function(record) {
              //console.log('record=',i,'  :', JSON.stringify(record, null, 2));
              var condition = false;
              var foreginKeyRecords = record[populateModel];
              for (var j in foreginKeyRecords) {
                var cmp = true;
                console.log('---------->keys', JSON.stringify(keys));
                for (var k in keys) { 
                  //now only support == compare
                  console.log('----->', foreginKeyRecords[j][keys[k]], Criteria[keys[k]]);
                  if(!(foreginKeyRecords[j][keys[k]] == Criteria[keys[k]])) {
                    cmp = false;
                    break;
                  }
                }
                if (cmp) {
                  condition = true;
                  break;
                }
              };

              if (condition) cnt++;
              console.log('i='+i+'====>condition='+condition+',cnt=', cnt);
            });
            cb();
          })
        },
        function(err) {
          //console.log('3333333====>cnt=', cnt, '  e:'+err);
          if (err) 
            resolve(0);
          else
            resolve(cnt);
        }
      );
    })
  });
}


module.exports = {
  countModel: function(model, limit, populateModel, Criteria) {
    return _countModel(model, limit, populateModel, Criteria);
  },

};

