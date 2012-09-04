var mongoose = require('mongoose');

var schema = new mongoose.Schema({
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
  sam_number: String
});


schema.plugin(require('mongoose-api-query'));

module.exports = DB.model('Exclusion', schema);