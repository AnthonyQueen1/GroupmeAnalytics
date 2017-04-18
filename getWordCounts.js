// getWordCounts.js
var connection = require('./dbConnector')

function getWordCounts() {}


getWordCounts.prototype.getMostCommonWords = function(req, res) {
	connection.getMostCommonWords(req.query.limit, function(err, data) {
		if(err) {
			res.status(500).send(err)
		}
		else {
			res.status(200).send(data)
		}
	});
}

module.exports = new getWordCounts();