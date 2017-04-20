var express 			= require('express');
var router  			= express.Router();
var path    			= require('path');
var connection = require('./dbConnector')
var processor = require('./messageProcessor')

router.get('/groupme/user', function(req, res) {
	res.sendFile(path.join(__dirname, '../public/user.html'));
 });

 router.get('/groupme/', function(req, res) {
	res.sendFile(path.join(__dirname, '../public/index.html'));
});

router.post('/groupme/api/word-counts/', function(req, res) {
	processor.uploadData(req.body.names, req.body.ids, req.body.token)
});

router.get('/groupme/api/word-counts/:id/:num', function(req, res) {
	connection.getMostUsedWords(req.params.id, req.params.num, function(err, data) {
		if(err) res.status(500).send(err)
		else res.status(200).json(data)
	});
});

router.get('/groupme/api/word-counts/:id/:num/common', function(req, res) {
	connection.filterOutCommonCase(req.params.id, req.params.num, function(err, data) {
		if(err) res.status(500).send(err)
		else res.status(200).json(data)
	});
});

router.get('/groupme/api/get-group-list', function(req, res) {
	connection.getGroupList(function(err, data) {
		if(err) res.status(500).send(err)
		else res.status(200).json(data)
	});
});

module.exports = router;