var express = require('express');
var app 	= express();
var path    = require('path');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var port 	= process.env.PORT || 3003;

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
// uses the routes.js file
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(require('./app/routes'));
app.use(favicon(path.join(__dirname, 'public','favicon.ico')));

app.listen(port, function() {
  	console.log('Listening on port ' + port);
});
