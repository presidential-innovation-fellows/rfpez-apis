var request = require("request");
var csv = require("csv");
var moment = require("moment");
var _ = require("underscore");

module.exports = function(req, res) {
  var fpdsURL = 'https://www.fpds.gov/dbsight/search.do?s=FPDSNG.COM&indexName=awardfull&templateName=CSV&q=' + req.query.q + '&renderer=jsp&length=1000';
  var awards = [];
  var per_page = parseInt(req.query.per_page) || 10;
  var page = parseInt(req.query.page) || 1;
  var skip = (page - 1) * per_page;
  var sort = req.query.sort || "date_signed_unix";
  var ascOrder = req.query.order === "asc" ? true : false;

  var machinifyKey = function(k) {
    return k.replace(/\/|\s|-/g, '_').replace(/_+/, '_').replace(/[\(\)\$]/g, '').replace(/_$/g, '').toLowerCase();
  };

  request(fpdsURL, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      csv()
      .from(body, {columns: true, trim:true})
      .on('record', function(data,index){
        newRecord = {};
        var hasValues = false;
        for (key in data) {
          if (key !== "") newRecord[machinifyKey(key)] = data[key];
          if (machinifyKey(key) === "date_signed" && moment(data[key]) !== null) {
            newRecord["date_signed_unix"] = moment(data[key]).unix();
          }
          if (!hasValues && data[key] !== null) hasValues = true;
        }
        if (hasValues) awards.push(newRecord);
      })
      .on('end', function(count){

        var awardsToSend = [];

        awards = _.sortBy(awards, "date_signed_unix");
        if (!ascOrder) awards = awards.reverse()

        var counter = 0;
        _.each(awards, function(award){
          counter++;
          if (counter > skip && awardsToSend.length < per_page) {
            awardsToSend.push(award);
          }
        });

        var toSend = {
                        meta: {
                                count: count,
                                page: (skip / per_page) + 1,
                                perPage: per_page,
                                totalPages: Math.ceil(count / per_page)
                              },
                        results: awardsToSend
                      };
        res.send(toSend);
      })
      .on('error', function(error){
        console.log(error.message);
        res.send({err: error.message});
      });
    } else {
      res.send({status: "ERROR"});
    }
  });
};