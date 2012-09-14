var Exclusion = require('../models/exclusion');
var request = require('superagent');

exports.index = function(req, res) {

  var query = Exclusion.apiQuery(req.query);
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

exports.searchParagraph = function(req, res) {
  console.log(req.params.paragraph);
  request.get('http://50.17.218.115/text2people/%5B"' + req.params.paragraph + '"%5D')
  .end(function(json){
    if (json.ok) {
      var names = JSON.parse(json.text);
      var matches = [];
      var searchNames = function (names, cb) {
        var name = names.shift();
        // Better search coming soon.
        Exclusion.findOne({name: name.matched_string}, function(err, exclusion){
          if (exclusion) matches.push(name);
          names.length === 0 ? cb() : searchNames(names, cb)
        });
      }
      searchNames(names, function(){
        res.send(matches);
      });
    } else {
      res.send('error')
    }
  });

};