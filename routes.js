exports.init = function(app){
  app.get('/bizs', require('./controllers/biz').index);
  app.get('/bizs/:user_id', require('./controllers/biz').show);

  app.get('/exclusions', require('./controllers/exclusion').index);
  app.get('/exclusions/searchparagraph/:paragraph', require('./controllers/exclusion').searchParagraph);

  app.get('/opportunities', require('./controllers/opportunity').index);
  app.get('/opportunities/fbozombie/:solnbr', require('./controllers/fbo_zombie'));

  app.get('/formtimer', require('./controllers/formtimer').index);
  app.get('/formtimer/create', require('./controllers/formtimer').create);
  app.get('/formtimer/example', require('./controllers/formtimer').example);
  app.get('/formtimer/example/results', require('./controllers/formtimer').results);
};