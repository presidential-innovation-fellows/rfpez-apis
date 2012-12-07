var request = require("request");
var csv = require("csv");

module.exports = function(req, res) {
  var fpdsURL = 'https://www.fpds.gov/dbsight/search.do?s=FPDSNG.COM&indexName=awardfull&templateName=CSV&q=' + req.query.q + '&renderer=jsp&length=1000';
  var awards = [];
  var limit = parseInt(req.query.limit, 10) || 10;
  var skip = parseInt(req.query.skip, 10) || 0;

  var numAwards = 0;

  var machinifyKey = function(k) {
    return k.replace(/\/|\s|-/g, '_').replace(/_+/, '_').replace(/[\(\)\$]/g, '').replace(/_$/g, '').toLowerCase();
  };

  var counter = 0;
  request(fpdsURL, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      csv()
      .from(body, {columns: true, trim:true})
      .on('record', function(data,index){
        counter++;
        if (counter > skip && awards.length < limit) {
          newRecord = {};
          for (key in data) {
            if (key !== "") newRecord[machinifyKey(key)] = data[key];
          }
          awards.push(newRecord);
        }
      })
      .on('end', function(count){
        var toSend = {
                        meta: {
                                count: count,
                                page: (skip / limit) + 1,
                                perPage: limit,
                                totalPages: Math.ceil(count / limit)
                              },
                        results: awards
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