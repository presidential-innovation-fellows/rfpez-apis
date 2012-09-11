var Opportunity = require('../models/opportunity');

exports.index = function(req, res) {

  var query = Opportunity.find().limit(10); //.sort('name');
  var response = {};

  query.exec(function (err, results) {
    if (err) res.send({err:err});
    else {
      response.results = results;
      //response.meta = {perPage: perPage, page: page};

      query.count(function(err, count){
        //response.meta.count = count;
        //response.meta.totalPages = Math.ceil(count / perPage);
        res.send(response);
      });
    }
  });

};
