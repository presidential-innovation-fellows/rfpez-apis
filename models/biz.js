var mongoose = require('mongoose');
var request = require('superagent');
var GeocodeCache = require('./geocode_cache');

var bizSchema = new mongoose.Schema({
  user_id: {type: String, index: true},
  name: String,
  address: String,
  address1: String,
  city: String,
  cnty: String,
  state: String,
  zip: String,
  phone: String,
  fax: String,
  cdist: String,
  msa: String,
  duns: String,
  cage: String,
  yrest: String,
  contact: String,
  title: String,
  url: String,
  gcc: {type: Boolean, default: false},
  edi: {type: Boolean, default: false},
  busparntdunsnmb: String,
  exportcd: {type: Boolean, default: false},
  exporctobjtvtxt: String,
  technetind: String,
  emall: String,
  tof: String,
  minc: String,
  women: {type: Boolean, default: false, index: true},
  veteran: {type: Boolean, default: false, index: true},
  dav: {type: Boolean, default: false, index: true},
  vietnam: {type: Boolean, default: false, index: true},
  rgstrtnccrind: {type: Boolean, default: false, index: true},
  buslastupdtdt: Date,
  latlon: Array,

  naics: [ new mongoose.Schema({
    naicscd: Number,
    naicsyrnmb: Number,
    naicsprimind: {type: Boolean, default: false},
    naicsgreenind: {type: Boolean, default: false},
    naicssmllbusind: {type: Boolean, default: false},
    naicsemrgsmllbusind: {type: Boolean, default: false}
  })]
  //alt simpler NAICS
  //naics: Array
});

bizSchema.index({'latlon':'2d'});

bizSchema.pre('save', function (next) {
  var biz = this,
    addressString = '',
    addressProps = ['address', 'city', 'st', 'zip'];

  var hasChanged = false;
  for (i=0; i<addressProps.length; i++) {
    if (this._modified(addressProps[i]) === true) {
      hasChanged = true;
      break;
    }
  }

  if (hasChanged || this.isNew){
    var full_address = this.address + ' ' + this.city + ', ' + this.state + ' ' + this.zip;

    cachedGeocodes = GeocodeCache.findOne({address: full_address}, function(err, result) {
      if (err || result === null) {
        request.get('http://50.17.218.115/street2coordinates/' + full_address)
        .end(function(res){
          if (res.ok) {
            var json = JSON.parse(res.text);
            var results = json[Object.keys(json)[0]];
            var newCache;
            if (results === null) {
              console.log("Couldn't geocode the following:");
              console.log(json);
              newCache = new GeocodeCache({address: full_address, latlon: null});
            } else {
              biz.latlon = [results['longitude'], results['latitude']];
              newCache = new GeocodeCache({address: full_address, latlon: biz.latlon});
              console.log('Geocoded! ' + results['longitude'] + ', ' + results['latitude']);
            }
            newCache.save(function(err){
              if (err) console.log("error saving new cache");
              next();
            });
          } else {
            console.log('Oh no! error!');
            next();
          }
        });
      } else {
        if (biz.latlon !== null) {
          biz.latlon = result.latlon;
        }
        console.log('geocoded from cache');
        next();
      }
    });



  } else {
    next();
  }

});

//h4ck from previous project that gives a nice shortcut
mongoose.Schema.prototype.__proto__._modified = function(prop){
  var modified;
  if (typeof(prop) !== "undefined") {
    modified = typeof(this._activePaths.states.modify[prop]) !== "undefined";
  } else {
    modified = [];
    for(var p in this._activePaths.states.modify){
      if (this._activePaths.states.modify[p] === true){
        modified.push(p);
      }
    }
  }

  return modified;
};

bizSchema.plugin(require('mongoose-api-query'));

module.exports = DB.model('Biz', bizSchema);