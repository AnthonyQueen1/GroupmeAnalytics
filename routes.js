var express = require('express');
var router  = express.Router();
var path    = require('path');
var request = require('request');
const pug 	= require('pug');

const compiledFunction = pug.compileFile(path.join(__dirname, 'pug/index.pug'));

router.get('/groupme/api', function(req, res) {
	// get the token from the url on redirect
	var body;
	token = req.url.replace('/groupme/api?access_token=', "");
	console.log('access Token: ' + token);
	request('https://api.groupme.com/v3/groups?token=' + token, function (error, response, body) {
		console.log('error:', error);
		console.log('statusCode:', response && response.statusCode);
		body = JSON.parse(body);
	});

	// send user back to homepage after logging in
	res.send(compiledFunction(body));
 });

router.get('/groupme/', function(req, res) {
  	res.sendFile(path.join(__dirname, 'index.html'));
});

router.get('/groupme/pug', function(req, res) {
	body = [1,2.3];
	res.send(compiledFunction(body));
});

router.get('*', function(req, res) {
	res.send('unknown URL in node (groupme): ' + req.url);
});

function dispdata(){
	// make request to groupme with new token
}

module.exports = router;
