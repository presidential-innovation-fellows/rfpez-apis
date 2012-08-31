var mongoose = require('mongoose');

var geocodeCacheSchema = new mongoose.Schema({
  address: String,
  latlon: Array
});

module.exports = DB.model('GeocodeCache', geocodeCacheSchema);