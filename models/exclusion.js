var mongoose = require('mongoose');

var exclusionSchema = new mongoose.Schema({
  classification: String,
  name: {type: String, index: true},
  prefix: String,
  first: String,
  middle: String,
  last: String,
  suffix: String,
  address_1: String,
  address_2: String,
  address_3: String,
  address_4: String,
  city: String,
  state_province: String,
  country: String,
  zip_code: String,
  duns: {type: String, index: true},
  exclusion_program: String,
  exclusion_agency: String,
  ct_code: String,
  exclusion_type: String,
  additional_comments: String,
  active_date: String,
  termination_date: String,
  record_status: String,
  cross_reference: String,
  sam_number: {type: String, index: true}
});

exclusionSchema.index({ first: 1, last: 1 });

exclusionSchema.statics.nameSearch = function(name, cb) {
  var prefixes = /^\(?(dr|mr|ms|mrs|col|sgt|sergeant|cpt|captain|ltc|major|maj|chief|cwo|ssg|sfc)\)?\.?\s/i;
  var suffixes = /\s?(jr|sr|ii|iii|iv|v|esq|ph\.?d|m\.?d)\.?$/i;
  var cleanNameBits = name.replace(prefixes, '').replace(suffixes, '').split(" ");
  var firstName = new RegExp(cleanNameBits.shift(), 'i');
  var lastName = new RegExp(cleanNameBits.pop(), 'i');
  if (cb) {
    this.findOne({first:firstName, last:lastName}, cb);
  } else {
    return this.findOne({first:firstName, last:lastName});
  }
};

exclusionSchema.plugin(require('mongoose-api-query'));

module.exports = DB.model('Exclusion', exclusionSchema);