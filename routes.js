exports.init = function(app){
  app.get('/bizs', require('./controllers/biz').index);
  app.get('/bizs/:user_id', require('./controllers/biz').show);

  app.get('/exclusions', require('./controllers/exclusion').index);
};