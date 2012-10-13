var Browser = require("zombie");

module.exports = function(req, res) {

  var browser = new Browser();

  browser.visit("http://www.sam.gov", function(){
    browser.fill('[title="Search Text"]', req.params.duns)
    .pressButton(".submithome", function(){
      var name = browser.text(".li_search_results:eq(0) .results_body_text:eq(0)");
      var duns = browser.text(".li_search_results:eq(0) .results_body_text:eq(2)");
      if (!name) return res.send({status: "Not found!"});
      return res.send({status: "success", name: name, duns: duns});
    });
  });

};