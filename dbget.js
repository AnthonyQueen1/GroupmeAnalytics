var request = require('request');
var mysql = require('mysql');


var connection = mysql.createConnection({
	host     : 'example.org',
	user     : 'bob',
	password : 'secret'
});

var get_top_words_group = function(g_id, amt_get, callback){
	console.log(g_id, amt_get);
}

module.exports = {
	get_top_words_group: get_top_words_group,
};