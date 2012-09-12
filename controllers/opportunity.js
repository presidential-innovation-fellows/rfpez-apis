var Opportunity = require('../models/opportunity');

exports.index = function(req, res) {

  var query = Opportunity.apiQuery(req.query);
  var response = {};

  query.exec(function (err, results) {
    if (err) res.send({err:err});
    else {
      response.results = results;
      response.meta = {
        perPage: query.options.limit,
        page: (query.options.skip / query.options.limit) + 1
      };

      query.count(function(err, count){
        response.meta.count = count;
        response.meta.totalPages = Math.ceil(count / response.meta.perPage);
        res.send(response);
      });
    }
  });

};