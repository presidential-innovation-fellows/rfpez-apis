exports.init = function(app){
  app.get('/bizs', require('./controllers/biz').index);
  app.get('/bizs/:user_id', require('./controllers/biz').show);

  app.get('/exclusions', require('./controllers/exclusion').index);
  app.get('/exclusions/searchparagraph/:paragraph', require('./controllers/exclusion').searchParagraph);

  app.get('/opportunities', require('./controllers/opportunity').index);
};