var fs = require('fs')
  , csv = require('csv');

var mongoose = require('mongoose');

if (process.env.MONGOHQ_URL) {
  global.DB = mongoose.createConnection(process.env.MONGOHQ_URL)
} else {
  global.DB = mongoose.createConnection('localhost', 'rfpez-apis');
}

var Exclusion = require('../models/exclusion');

var mongooseKeyFor = function (key) {
  return key.replace(/\/|\s|-/g, '_').replace(/_+/, '_').toLowerCase();
};

var parse = function(req, res) {

  // empty database
  Exclusion.collection.remove({});

  var dataFolder = __dirname + '/../_data/epls/';

  if (process.argv.indexOf('--sample-data') !== -1) {
    console.log("++++++++ USING SAMPLE DATA ++++++++");
    var csv_file = dataFolder + 'exclusions_sample.csv';
  } else {
    var csv_file = dataFolder + 'exclusions.csv';
  }

  var exclusions = new Array();

  csv()
    .fromPath(csv_file, {
      columns: true
    })
    .on('data',function(data,index){
      newRecord = {};
      for (key in data) {
        newRecord[mongooseKeyFor(key)] = data[key];
      }
      exclusions.push(newRecord);
    })
    .on('end',function(count){

      var saveExclusions = function (exclusions) {
        var newExclusion = new Exclusion(exclusions.shift());
        newExclusion.save(function(){
          console.log('saved!');
          if (exclusions.length > 0) {
            saveExclusions(exclusions);
          } else {
            process.exit();
          }
        })
      }

      saveExclusions(exclusions);
    })

};

parse();