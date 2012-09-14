var Exclusion = require('../models/exclusion');

var digDeeper = function(req, res) {
  var prefixes = /^\(?(dr|mr|ms|mrs|col|sgt|sergeant|cpt|captain|ltc|major|maj|chief|cwo|ssg|sfc)\)?\.?\s/i;
  var suffixes = /\s?(jr|sr|ii|iii|iv|v|esq|ph\.?d|m\.?d)\.?$/i;
  var cleanNameBits = req.query.name.replace(prefixes, '').replace(suffixes, '').split(" ");
  var firstName = cleanNameBits.shift();
  var lastName = cleanNameBits.pop();

  req.query = {first:firstName, last:lastName};
  index(req, res);

};

var index = exports.index = function(req, res) {

  var query = Exclusion.apiQuery(req.query);
  var response = {};

  query.exec(function (err, results) {
    if (err) res.send({err:err});
    else if (results.length === 0 && typeof req.query.first === 'undefined' && typeof req.query.name !== 'undefined') {
      digDeeper(req, res);
    }
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


