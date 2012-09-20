var FormTimer = require('../models/formtimer');

exports.index = function(req, res) {
  if (typeof req.query.url === 'undefined' || typeof req.query.form === 'undefined') {
    res.send({err:'must have url and form params e.g. url=http://mysite.com/somepage&form=myformid'});
  } else if (req.query.stats){
    FormTimer.stats(req.query.url + "#" + req.query.form, function(err, result){
      if (err) {
        res.send(err);
      } else if (result.length === 0) {
        res.send({"_id": req.query.url + "#" + req.query.form, count:0});
      } else {
        res.send(result[0]);
      }
    });
  } else {
    req.query.form = req.query.url + "#" + req.query.form;
    delete req.query.url;
    var query = FormTimer.apiQuery(req.query);
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
  }
};

exports.create = function(req, res) {
  var ft = new FormTimer({
    form: req.headers.referer + "#" + req.query.formId,
    duration: req.query.duration,
    ip: req.client.remoteAddress
  });
  ft.save(function(err){
    if (err) console.log("ERROR: " , err);
    res.send('OK');
  });
};

exports.example = function(req, res) {
  console.log("formtimer::example");
  var testform = "<html><body><form id='myformid'><input name='test' /><select><option>One</option><option>Two</option></select><input type='submit' />";
  testform += "</form><script src='/js/formtimer.js'></script></body></html>";
  res.send(testform);
};