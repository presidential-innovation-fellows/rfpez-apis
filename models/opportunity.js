var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  type: String,
  data: {}
});
//schema.plugin(require('mongoose-api-query'));

module.exports = DB.model('Opportunity', schema);