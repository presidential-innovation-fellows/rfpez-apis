var mongoose = require('mongoose');

var oppschema = new mongoose.Schema({
  TYPE: { type: String, index: true },
  NAICS: { type: String, index: true },
  SOLNBR: { type: String, index: true },
  SUBJECT: String,
  OFFADD: String,
  EMAIL: String,
  AGENCY: String,
  DATE: Date,
  OFFICE: String,
  LOCATION: String,
  CLASSCOD: String,
  CONTACT: String,
  DESC: String,
  URL: String,
  SETASIDE: String,
  POPCOUNTRY: String,
  POPADDRESS: String,
  ZIP: String,
  POPZIP: String,
  ARCHDATE: Date,
  RESPDATE: Date,
  AWDDATE: Date,
  AWDNBR: String,
  MODNBR: String,
  NTYPE: String,
  FOJA: String,
  DONBR: String
});

oppschema.plugin(require('mongoose-api-query'));

module.exports = DB.model('Opportunity', oppschema);