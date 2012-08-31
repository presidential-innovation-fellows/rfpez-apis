var fs = require('fs')
  , csv = require('csv')
  , jsdom = require('jsdom')
  , request = require('request')
  , mongoose = require('mongoose')
  , sys = require('sys')
  , exec = require('child_process').exec;

if (process.env.MONGOHQ_URL) {
  global.DB = mongoose.createConnection(process.env.MONGOHQ_URL)
} else {
  global.DB = mongoose.createConnection('localhost', 'rfpez-apis');
}

var Exclusion = require('../models/exclusion');

var dataFolder = __dirname + '/../_data/epls/';

var mongooseKeyFor = function (key) {
  return key.replace(/\/|\s|-/g, '_').replace(/_+/, '_').toLowerCase();
};

var parse = function(req, res) {

  // empty database
  Exclusion.collection.remove({});

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
          console.log('saved record.');
          if (exclusions.length > 0) {
            console.log(exclusions.length + ' records remaining.');
            saveExclusions(exclusions);
          } else {
            process.exit();
          }
        })
      }

      saveExclusions(exclusions);
    })

};

jsdom.env({
  html: 'https://www.sam.gov/public-extracts/SAM-Public/',
  scripts: [
    'http://code.jquery.com/jquery-1.5.min.js'
  ],
  done: function(errors, window) {
    var $ = window.$;
    var href = $('a:last').attr('href');
    console.log("Grabbing file: https://www.sam.gov/public-extracts/SAM-Public/" + href);
    var savedZip = fs.createWriteStream(dataFolder + 'exclusions.zip');
    request("https://www.sam.gov/public-extracts/SAM-Public/" + href)
    .pipe(savedZip)
    .on('close', function () {
      console.log('Zip file saved!. Now uncompressing...');
      exec("cd " + dataFolder + "; tar -xzf " + dataFolder + "exclusions.zip; mv " + dataFolder + "SAM*.CSV " + dataFolder + "exclusions.csv", function (error, stdout, stderr) {      // one easy function to capture data/errors
          console.log('stdout: ' + stdout);
          console.log('stderr: ' + stderr);
          if (error !== null) {
            console.log('exec error: ' + error);
          }
          console.log("Now parsing...");
          parse();
        });
    });
  }
});
