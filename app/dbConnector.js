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
	this.connection.query('select * from messages where group_id = '+ object.id, 
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
	this.connection.query('INSERT messages SET ?', grouptuple, function(err) {
		if(err) console.log(err)
	});
}

dbConnector.prototype.insertGroup = function(object, group) {
	console.log(group)
	this.connection.query('INSERT groups (group_id, group_name, message_count) VALUES ? ON DUPLICATE KEY UPDATE message_count = VALUES(message_count)', [[group]], function(err) {
		if(err) {
			console.log("\nError inserting Group: " + group + "\n")
			console.log(err)
		}
	});
}

dbConnector.prototype.insertBulkMessages = function(object, messages) {
	this.connection.query('INSERT messages (group_id, message_id, message_length) VALUES ?', [messages], function(err) {
		if(err) {
			console.log("\nError inserting bulk messages:\n")
			console.log(err)
		}
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
	this.connection.query('INSERT wordcount (word, count) VALUES ? ON DUPLICATE KEY UPDATE count = count + VALUES(count)', [wordtuples], function(err) {
		if(err) {
			console.log("\nError inserting bulk words:\n")
			console.log(err)
		}
		else if(object.debug) {
			console.log("\nFinished inserting bulk words of size " + wordtuples.length)
			object.t1 = new Date().getTime()
			console.log("Inserting bulk words took "  + (object.t1-object.t0)/1000 + " seconds")
		}
	});
}

dbConnector.prototype.insertBulkGroupWords = function(object, grouptuples) {
	this.connection.query('INSERT INTO groupwordcount (group_id, word, count) VALUES ? ON DUPLICATE KEY UPDATE count = count + VALUES(count)', [grouptuples], function(err){
		if (err) {
			console.log(err);
		}
		else if(object.debug) {
			console.log("\nFinished inserting bulk group words of size " + grouptuples.length)
			object.t1 = new Date().getTime()
			console.log("Inserting bulk group words took "  + (object.t1-object.t0)/1000 + " seconds")
		}
	});
}

dbConnector.prototype.getMostCommonWords = function(limit, callback) {
	var limit = (limit<=500) ? limit: 10;
	this.connection.query('SELECT * FROM wordcount ORDER BY count DESC, word ASC LIMIT '+ limit, callback);
}

dbConnector.prototype.getMostUsedWords = function(id, limit, callback) {
	var limit = (limit<=500) ? limit: 25;
	if (id == 'all'){
		this.connection.query('SELECT * FROM wordcount ORDER BY count DESC, word ASC LIMIT '+ limit, callback);
	} else {
		this.connection.query('SELECT word, count FROM groupwordcount WHERE group_id = ' + id + ' ORDER BY count DESC, word ASC LIMIT ' + limit, callback);
	}
}

dbConnector.prototype.filterOutCommonCase = function(id, limit, callback){
	var limit = (limit<=500) ? limit: 25;
	if (id == 'all'){
		this.connection.query('SELECT wc.word, wc.count FROM wordcount wc LEFT JOIN commonCase cc ON wc.word = cc.common_word WHERE cc.common_word IS NULL ORDER BY wc.count DESC, word ASC LIMIT '+ limit, callback);
	} else {
		this.connection.query('SELECT gwc.word, gwc.count, gwc.group_id FROM groupwordcount gwc LEFT JOIN commonCase cc ON gwc.word = cc.common_word WHERE cc.common_word IS NULL AND gwc.group_id = ' + id + ' ORDER BY gwc.count DESC, word ASC LIMIT ' + limit, callback);
	}
}

dbConnector.prototype.getGroupList = function(callback) {
	this.connection.query('SELECT * FROM groups ORDER BY group_name ASC', callback);
};

dbConnector.prototype.getTotalGroups = function(callback) {
	this.connection.query('SELECT COUNT(*) AS count FROM groups', callback);
};

dbConnector.prototype.getTotalMessages = function(callback) {
	this.connection.query('SELECT COUNT(*) AS count FROM messages', callback);
};

dbConnector.prototype.getTotalWords = function(callback) {
	this.connection.query('SELECT sum(count) AS count FROM wordcount', callback);
};

module.exports = new dbConnector();