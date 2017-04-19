var express 			= require('express');
var router  			= express.Router();
var path    			= require('path');
var uploadGroupData 	= require('./uploadGroupData');
var getWordCounts 		= require('./getWordCounts');
var connection			= require('./dbConnector');

router.get('/groupme/user', function(req, res) {
	res.sendFile(path.join(__dirname, '/public/user.html'));
 });

router.post('/groupme/api/get-all-word-counts/', function(req, res){
	uploadGroupData.uploadData(req.body.names, req.body.ids, req.body.token);
});

router.get('/groupme/', function(req, res) {
	res.sendFile(path.join(__dirname, '/public/index.html'));
});

router.get('/groupme/api/most-used-words/:id/:num', function(req, res){
	connection.get_most_common_words(req.params.id, req.params.num, function(err, data){
		if (err) { console.log(err);
		} else {
			res.json(data);
		}
	});
});

router.get('/groupme/api/group-list', function(req, res){
	connection.get_group_list(function(err, data) {
		if(err) { console.log(err);
		} else {
			res.json(data);
		}
	});
});

router.get('/groupme/api/getCommonWords:limit?', getWordCounts.getMostCommonWords);

module.exports = router;
