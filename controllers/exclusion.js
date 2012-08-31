var Exclusion = require('../models/exclusion');

exports.index = function(req, res) {

  var page = parseInt(req.query.page, 10) || 1;
  var perPage = 10;
  var query = Exclusion.apiQuery(req.query).limit(perPage).skip((page-1)*perPage).sort('name');
  var response = {};

  query.exec(function (err, results) {
    if (err) res.send({err:err});
    else {
      response.results = results;
      response.meta = {perPage: perPage, page: page};

      query.count(function(err, count){
        response.meta.count = count;
        response.meta.totalPages = Math.ceil(count / perPage);
        res.send(response);
      });
    }
  });

};
