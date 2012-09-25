var Browser = require("zombie");

module.exports = function(req, res) {

  var browser = new Browser();

  var parsePage = function(){
    var json = {
      posted_date: browser.text("#dnf_class_values_procurement_notice__posted_date__widget"),
      response_date: browser.text("#dnf_class_values_procurement_notice__response_deadline__widget"),
      set_aside: browser.text("#dnf_class_values_procurement_notice__set_aside__widget"),
      original_set_aside: browser.text("#dnf_class_values_procurement_notice__original_set_aside__widget"),
      classification_code: browser.text("#dnf_class_values_procurement_notice__classification_code__widget"),
      solnbr: browser.text(".sol-num").replace("Solicitation Number: ", ""),
      title: browser.text(".agency-header h2"),
      statement_of_work: browser.html("#dnf_class_values_procurement_notice__description__widget"),
      email: ""
    }

    var poc = browser.text("#dnf_class_values_procurement_notice__primary_poc__widget");
    console.log(poc);

    if (!poc) poc = browser.text("#dnf_class_values_procurement_notice__poc_text__widget");
    var emailMatch = poc.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i);
    var phoneMatch = poc.replace(/\./g, '')
                        .replace(/\-/g, '')
                        .replace(/\)/g, '')
                        .replace(/\(/g, '')
                        .replace(/\s/g, '')
                        .replace(/Fax: .*/, '')
                        .match(/[0-9]{10,11}/);

    if (emailMatch) json["email"] = emailMatch[0];
    if (phoneMatch) json["phone"] = phoneMatch[0];

    var agencyNameBits = browser.query(".agency-name").innerHTML.split("<br />");

    if (agencyNameBits[0]) json["agency"] = agencyNameBits[0].replace('Agency: ', '');
    if (agencyNameBits[1]) json["office"] = agencyNameBits[1].replace('Office: ', '');
    if (agencyNameBits[2]) json["location"] = agencyNameBits[2].replace('Location: ', '');

    var naics = browser.text("#dnf_class_values_procurement_notice__naics_code__widget").match(/[0-9]{6}/);
    if (naics[0]) json["naics"] = naics[0];

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