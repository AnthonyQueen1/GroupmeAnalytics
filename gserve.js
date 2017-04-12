var express = require('express');
var app 	= express();
var path    = require('path');
var bodyParser = require('body-parser');
var port 	= process.env.PORT || 3001;

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
// uses the routes.js file
app.use('/groupme', express.static(path.join(__dirname, 'public')));
app.use(require('./routes'));

app.listen(port, function() {
  	console.log('Listening on port ' + port);
});
