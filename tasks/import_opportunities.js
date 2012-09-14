var fs = require('fs');
var mongoose = require('mongoose');
var FBOParser = require('../lib/fbo-parser');
var FTPClient = require("ftp");

if (process.env.MONGOHQ_URL) {
  global.DB = mongoose.createConnection(process.env.MONGOHQ_URL)
} else {
  global.DB = mongoose.createConnection('localhost', 'rfpez-apis');
}

var Opportunity = require('../models/opportunity');
var ImportedFBODump = require('../models/imported_fbo_dump');


var conn = new FTPClient();

conn.on('connect', function() {
  // authenticate as anonymous
  conn.auth(function(e) {
    if (e) throw e;
    conn.list(function(e, entries) {
      if (e) throw e;

      var files = [];
      for (var i=0,len=entries.length; i<len; ++i) {
        if (entries[i].name.indexOf("FBOFeed") !== -1) {
          var onlyImportAfter = new Date(2012, 09, 01);
          var matches = entries[i].name.match(/FBOFeed([0-9]{4})([0-9]{2})([0-9]{2})/);
          var thisDate = new Date(matches[1], matches[2], matches[3]);

          if (thisDate.getTime() >= onlyImportAfter.getTime()) {
            files.push(entries[i]);
          }
        }
      }

      var strToDate = function(st) {
        if (typeof st === 'string') {
          return new Date("20" + st.substr(4,2) + "-" + st.substr(0,2) + "-" + st.substr(2,2));
        } else {
          return st;
        }
      };


      var saveOpportunities = function (records, cb) {

        var record = records.shift()[0];
        var preopp = {TYPE:Object.keys(record)[0]};
        var props = record[Object.keys(record)[0]];

        var tempdate = '';
        var tempdesc = '';

        for (var k in props) {
          if (k === "DATE" || k === "YEAR") {
            if (tempdate === '' && props[k] !== '') {
              tempdate = "20" + props.YEAR + "-" + props.DATE.substr(0, 2) + "-" + props.DATE.substr(2,2);
            }
          }
          else if (k === 'AWDDATE' || k === 'RESPDATE' || k === 'ARCHDATE') {
            if (props[k] !== '') preopp[k] = strToDate(props[k]);
          }
          else if (k === "DESC" || k === "DESC2" || k === "DESC3") {
            if (props[k] !== '') tempdesc = tempdesc + ' ' + props[k];
          }
          else if (k === "EMAIL2" && props[k] !== '') {
            preopp.EMAIL = props[k];
          }
          else if (props[k] !== '' && props[k] !== 'N/A') {
            preopp[k] = props[k];
          }
        }

        if (tempdate !== '') preopp.DATE = new Date(tempdate);
        if (tempdesc !== '') preopp.DESC = tempdesc;

        var opp = new Opportunity(preopp);

        opp.save(function(err){
          records.length === 0 ? cb() : saveOpportunities(records, cb);
        });

      };

      var checkIfFilesHaveBeenImported = function (files, cb) {
        var file = files.shift();
        if (!file || typeof file === 'undefined') cb();

        ImportedFBODump.findOne({name: file.name}, function(err, record){

          if (record === null) {

            conn.get(file.name, function(e, stream) {
              if (e) throw e;

              stream.on('success', function() {
                console.log('doing ' + file.name)

                var data = fs.readFileSync('temp_fbo.txt', 'utf-8');

                try {
                  var json = FBOParser.parse(data);
                  var loggedFBODump = new ImportedFBODump({name: file.name});
                  loggedFBODump.save(function(err){
                    saveOpportunities(json, function(){
                      files.length === 0 ? cb() : checkIfFilesHaveBeenImported(files, cb);
                    });
                  });
                } catch(err) {
                  console.log(err)
                  console.log(file.name)
                  files.length === 0 ? cb() : checkIfFilesHaveBeenImported(files, cb);
                }

              });

              stream.on('error', function(e) {
                console.log('ERROR during get(): ' + e);
                conn.end();
              });

              stream.pipe(fs.createWriteStream('temp_fbo.txt'));
            });

          } else {
            files.length === 0 ? cb() : checkIfFilesHaveBeenImported(files, cb);
          }
        })
      }

      checkIfFilesHaveBeenImported(files, function(){
        conn.end();
        process.exit();
      });

    });
  });
});
conn.connect(21, 'ftp.fbo.gov');




