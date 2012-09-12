var fs = require('fs');
var Biz = require('../models/biz');

exports.index = function(req, res) {

  var query = Biz.apiQuery(req.query);
  var response = {};

  if (req.query.ne_lat) {
    var box = [[parseFloat(req.query['sw_lng']), parseFloat(req.query['sw_lat'])], [parseFloat(req.query['ne_lng']),  parseFloat(req.query['ne_lat'])]];
    query = query.find({"latlon" : {"$within" : {"$box" : box}}})
  }

  query.exec(function (err, results) {
    console.log()
    if (err) res.send({err:err});
    else {
      response.results = results;
      response.meta = {
        perPage: query.options.limit,
        page: (query.options.skip / query.options.limit) + 1
      };
      res.send(response);
    }
  });
};

exports.show = function(req, res) {

  var q = Biz.findOne({user_id: req.params.user_id}, function(err, biz) {
    if (err) res.send({err: err});
    else {
      res.send(biz);
    }
  });
};
