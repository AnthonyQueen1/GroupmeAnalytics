var express = require('express'), router = express.Router();
var path    = require('path');
var request = require('request');
const pug 	= require('pug');

const compiledFunction = pug.compileFile(path.join(__dirname, 'pug/index.pug'));

router.get('/api', function(req, res) {
	// get the token from the url on redirect
	token = req.url.replace('/api?access_token=', "");
	console.log('access Token: ' + token);

	dispdata();

	// send user back to homepage after logging in
  	res.redirect('/pug');
 });

router.get('/', function(req, res) {
  	res.sendFile(path.join(__dirname, 'index.html'));
});

router.get('/pug', function(req, res) {
  	res.send(compiledFunction());
});

function dispdata(){
	// make request to groupme with new token
	request('https://api.groupme.com/v3/groups?token=' + token, function (error, response, body) {
		console.log('error:', error);
		console.log('statusCode:', response && response.statusCode);
		// console.log('body:', body);
		return body;
	});
}

module.exports = router;
