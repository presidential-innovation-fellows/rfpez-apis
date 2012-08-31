var fs = require('fs')
var mongoose = require('mongoose');

if (process.env.MONGOHQ_URL) {
  global.DB = mongoose.createConnection(process.env.MONGOHQ_URL)
} else {
  global.DB = mongoose.createConnection('localhost', 'rfpez-apis');
}

var Biz = require('../models/biz');

var dataFolder = __dirname + '/../_data/dsbs/';

if (process.argv.indexOf('--sample-data') !== -1) {
  console.log("++++++++ USING SAMPLE DATA ++++++++");
  var proid_file = dataFolder + 'PRO_ID_SAMPLE.TXT';
  var naics_file = dataFolder + 'NAICS_SAMPLE.TXT';
} else {
  var proid_file = dataFolder + 'PRO_ID.TXT';
  var naics_file = dataFolder + 'NAICS.TXT';
}

//not anymore!
//Biz.collection.remove({});

var convertToBoolean = function(props, json) {
  for (var i=0, len = props.length; i<len; i++) {
    if (typeof json[props[i]] == 'undefined') continue;
    if (json[props[i]].toUpperCase() == 'Y') {
      json[props[i]] = true;
    } else {
      json[props[i]] = false;
    }
  }
};

var parse = function() {
  importFromTxt(proid_file, function(doc, cb){

    //check to see if Biz already exists
    Biz.findOne({user_id: doc.user_id}, function(err, biz) {
      if (err) {
        console.log("ERR FINDING BIZ");
        return cb();
      } else {
        convertToBoolean(['gcc', 'edi', 'exportcd', 'women', 'veteran', 'dav', 'vietnam', 'rgstrtnccrind'], doc);
        if (biz === null) {
          console.log("New Biz");
          biz = new Biz(doc);
        } else {
          console.log("Existing Biz");
          //most likely nothing has changed, but let's double-check
          var hasChanged = false;
          for (var prop in doc) {
            if (biz[prop] !== doc[prop]) {
              hasChanged = true;
              biz[prop] = doc[prop];
            }
          }
          if (hasChanged === false) {
            return cb();
          }
        }

        biz.save(function(err) {
          if (err) console.log("Error saving newBiz: " + err);
          return cb();
        });
      }
    });
  }, function(){

    importFromTxt(naics_file, function(doc, cb){

      convertToBoolean(['naicsprimind', 'naicsgreenind', 'naicssmllbusind', 'naicsemrgsmllbusind'], doc);

      Biz.findOne({user_id: doc.user_id}, function(err, biz) {
        if (err) {
          console.log("ERR FINDING BIZ");
          return cb();
        } else if (biz === null) {
          console.log("NO BIZ MATCHES FOR " + doc.user_id + ". Moving on...");
          return cb();
        } else {
          delete doc['user_id'];
          biz.naics.push(doc);
          biz.save(function(err) {
            if (err) console.log("Error saving newBiz: " + err);
            console.log('naic saved user: ' + biz.user_id + ' naiccd: ' + doc.naicscd);
            return cb();
          });
        }
      });

    }, function(){
      console.log("Fin.");
      process.exit();
    });
  });

};

var importFromTxt = function(filepath, saveFn, cb) {
  fs.readFile(filepath, 'ascii', function (err,data) {
    if (err) return console.log("ERROR! -- \n" + err);

    var rows = data.split("\n");
    var keys = rows[0].split('\t');
    var numkeys = keys.length;

    var parseLine = function (rows) {
      var firstRow = rows.shift();
      if (rows.length === 0) return cb();
      var vals = firstRow.split('\t');
      var doc = {};

      for (var j=0; j<numkeys; j++){
        doc[keys[j].toLowerCase()] = (typeof vals[j] == 'undefined' || vals[j] === '') ? '' : vals[j].replace(/^\s+|\s+$/g,"");
      }

      saveFn(doc, function(){
        console.log(rows.length + ' rows remaining');
        parseLine(rows);
      });
    };

    rows.shift();
    parseLine(rows);
  });
};

parse();