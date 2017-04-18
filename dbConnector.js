// dbConnector.js
var mysql = require("mysql");
var request = require('request');

var dbConnector = function() {
	this.connection = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "theradio",
		database: "groupme"
	});
}

dbConnector.prototype.getAllMessages = function(object, lastmessageid, callback) {
	var requrl = 'https://api.groupme.com/v3/groups/'+ object.id + '/messages?token=' + object.token + '&limit=100';
	var formdata = (lastmessageid) ? requrl + '&before_id=' + lastmessageid : requrl;
	request.get(formdata, function(err, res, data) {
		if (err)	console.log(err)
		else 	callback.call(object, JSON.parse(data))
	})
}


dbConnector.prototype.getGroupMessages = function(object, callback) {
	this.connection.query('select * from groups where group_id = '+ object.id, 
		function(err, res, data) {
			if(err) console.log(err)
			else {
				if(object.debug) {
					object.t1 =new Date().getTime();
					console.log("\nGetting db messages took " + (object.t1-object.t0)/1000 + " seconds")
				}
				callback.call(object, res);	
			}
		}
	);
}

dbConnector.prototype.insertMessage = function(object, message, length) {
	grouptuple = { group_id: object.id, group_name: object.name, message_id: message.id, message_length: length}
	this.connection.query('INSERT groups SET ?', grouptuple, function(err) {
		if(err) console.log(err)
	});
}

dbConnector.prototype.insertBulkMessages = function(object, messages) {
	this.connection.query('INSERT groups (group_id, group_name, message_id, message_length) VALUES ?', [messages], function(err) {
		if(err) console.log(err)
		else {
			if(object.debug) {
				console.log("\nFinished inserting bulk messages of size " + messages.length)
				object.t1 = new Date().getTime();
				console.log('Inserting bulk messages took ' + (object.t1-object.t0)/1000 + ' seconds' )
			}
		}
	});
}

dbConnector.prototype.insertBulkWords = function(object, wordtuples){
	console.log("Starting Insert")
	this.connection.query('INSERT wordcount (word, count) VALUES ? ON DUPLICATE KEY UPDATE count = count + VALUES(count)', [wordtuples], function(err) {
		if(err) console.log(err)
		else if(object.debug) {
			console.log("\nFinished inserting bulk words of size " + wordtuples.length)
			object.t1 = new Date().getTime()
			console.log("Inserting bulk words took "  + (object.t1-object.t0)/1000 + " seconds\n")
		}
	});
}

dbConnector.prototype.insertBulkGroupWords = function(object, grouptuples) {
	this.connection.query('INSERT INTO groupwordcount (group_id, word, count) VALUES ? ON DUPLICATE KEY UPDATE count = count + VALUES(count)', [grouptuples], function(err){
		if (err) console.log(err);
		else if(object.debug) {
			console.log("\nFinished inserting bulk group words of size " + grouptuples.length)
			object.t1 = new Date().getTime()
			console.log("Inserting bulk group words took "  + (object.t1-object.t0)/1000 + " seconds\n")
		}
	});
}

dbConnector.prototype.getMostCommonWords = function(limit, callback) {
	var limit = (limit<=500) ? limit: 10;
	this.connection.query('SELECT * FROM wordcount ORDER BY count DESC LIMIT '+ limit, function(err, res, data) {
		if (err) console.log(err);
		callback.call(err, res);
	});
}

module.exports = new dbConnector();