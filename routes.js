var express = require('express');
var router  = express.Router();
var path    = require('path');
var db 		= require('./dbconnect');

router.get('/groupme/user', function(req, res) {
	// get the token from the url on redirect
	// token = req.url.replace('/groupme/api?access_token=', "");

	// console.log('access Token: ' + token);
	// (name, ids, token)
	names = ['SAC']
	ids = [10311087]
	token = '3VjvkSVgcjfhybCNnyIYjw7l8rw0QTfdQPYnEYa1';
	db.getdata(names, ids, token, "");
	// send user back to homepage after logging in
	// res.redirect('/groupme/pug');
	res.sendFile(path.join(__dirname, '/public/user.html'));
 });

router.get('/groupme/', function(req, res) {
	res.sendFile(path.join(__dirname, '/public/index.html'));
});




module.exports = router;
