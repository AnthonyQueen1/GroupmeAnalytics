// wordCountApi.js
var connector = require('./dbConnector')

var wordCountApi = {
		this.connection = new connector.dbConnector()
}

wordCountApi.prototype.getMostCommonWords = function() {
	this.connection.getCommonWords(this, 20, this.returnMostCommonWords);
}

wordCountApi.prototype.returnMostCommonWords = function(data) {
	console.log(data)
}

module.exports = {
	wordCountApi: wordCountApi,
};