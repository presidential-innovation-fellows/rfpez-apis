var Browser = require("zombie");

module.exports = function(req, res) {

  var browser = new Browser();

  var parsePage = function(){
    var json = {
      name: browser.text("#dnf_class_values_procurement_notice__primary_poc__widget div:nth-child(1)").replace(/,$/, ''),
      title: browser.text("#dnf_class_values_procurement_notice__primary_poc__widget div:nth-child(2)"),
      email: browser.text("#dnf_class_values_procurement_notice__primary_poc__widget div:nth-child(3)"),
      phone: browser.text("#dnf_class_values_procurement_notice__primary_poc__widget div:nth-child(4)").replace('Phone: ', ''),

      posted_date: browser.text("#dnf_class_values_procurement_notice__posted_date__widget"),
      response_date: browser.text("#dnf_class_values_procurement_notice__response_deadline__widget"),
      set_aside: browser.text("#dnf_class_values_procurement_notice__set_aside__widget"),
      original_set_aside: browser.text("#dnf_class_values_procurement_notice__original_set_aside__widget"),
      classification_code: browser.text("#dnf_class_values_procurement_notice__classification_code__widget"),
      solnbr: browser.text(".sol-num").replace("Solicitation Number: ", ""),
      naics: [],
      statement_of_work: browser.html("#dnf_class_values_procurement_notice__description__widget"),
      raw_point_of_contact: browser.html("#dnf_class_values_procurement_notice__poc_text__widget")
    }

    var agencyNameBits = browser.query(".agency-name").innerHTML.split("<br />");

    if (agencyNameBits[0]) json["agency"] = agencyNameBits[0].replace('Agency: ', '');
    if (agencyNameBits[1]) json["office"] = agencyNameBits[1].replace('Office: ', '');
    if (agencyNameBits[2]) json["location"] = agencyNameBits[2].replace('Location: ', '');

    var naicsBits = browser.text("#dnf_class_values_procurement_notice__naics_code__widget").split("/");

    for (var i = 0, len = naicsBits.length; i < len; i++) {
      var matches = naicsBits[i].match(/^[0-9]+/);
      if (matches) json["naics"].push(matches[0]);
    }

    return json;
  }

  browser.visit("http://www.fbo.gov", function(){
    browser.fill("#qs-kw", req.params.solnbr)
    .pressButton("#qs-submit", function(){
      var found = browser.query("#row_0 a");
      if (!found) return res.send("Not found!");
      browser.clickLink("#row_0 a", function(){
        res.send(
          parsePage()
        );
      });
    });
  });

};