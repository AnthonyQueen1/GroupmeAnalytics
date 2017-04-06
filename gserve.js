var express = require('express');
var app 	= express();
var port 	= process.env.PORT || 3001;
var path    = require('path');

// uses the routes.js file
app.use(require('./routes'));

app.listen(port, function() {
  	console.log('Listening on port 3001...');
})