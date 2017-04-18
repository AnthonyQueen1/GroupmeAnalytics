var express = require('express');
var router  = express.Router();
var path    = require('path');
var uploadGroupData 	= require('./uploadGroupData');
var getWordCounts = require('./getWordCounts')

router.get('/groupme/user', function(req, res) {
	res.sendFile(path.join(__dirname, '/public/user.html'));
 });

router.post('/groupme/api/get-all-word-counts/', function(req, res){
	uploadGroupData.uploadData(req.body.names, req.body.ids, req.body.token);
});

router.get('/groupme/', function(req, res) {
	res.sendFile(path.join(__dirname, '/public/index.html'));
});

router.get('/groupme/api/get-group-word-counts', function(req, res){
	console.log(req.body);
});

router.get('/groupme/api/getCommonWords:limit?', getWordCounts.getMostCommonWords);

module.exports = router;
