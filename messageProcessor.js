var request = require('request');
var mysql = require("mysql");

function messageProcessor(name, id, token) {
    this.name = name;
    this.id = id;
    this.token = token;
	this.message_count = 0;
	this.messages = {};
	this.words = {};
	this.insertCount = 0;
	this.insertFinished = 0;
	
	this.connection = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "theradio",
		database: "groupme"
	});
	this.getAllMessages('');
	
	//debugging
	this.debug = true;
	this.t0 = new Date().getTime();
	this.t1 = 0;	
}

messageProcessor.prototype.getAllMessages = function(lastmessageid) {
	var requrl = 'https://api.groupme.com/v3/groups/'+ this.id + '/messages?token=' + this.token + '&limit=100';
	var formdata = (lastmessageid) ? requrl + '&before_id=' + lastmessageid : requrl;
	var self = this;
	request.get(formdata, function(err, res, data) {
		if (err) console.log(err)
		self.addGMMessagesToList(JSON.parse(data));
	})
}

messageProcessor.prototype.addGMMessagesToList = function(data) {
		if(this.message_count == 0) {
			this.message_count = data.response.count;
			if(this.debug) console.log("Meesages to get: ",this.message_count)
		}
	
		for (var i=0; i<data.response.messages.length; i++){
			this.message_count--;
			this.messages[data.response.messages[i].id.toString()] = data.response.messages[i];
			if(this.message_count == 0) {
				this.t1 = new Date().getTime();
				if(this.debug) console.log("Getting groupme messages took ",(this.t1-this.t0)/1000, " seconds")
				//Step 2 Filtering
				this.getDBMessageList();
			}
				
			if (i==data.response.messages.length-1 && this.message_count > 0) 
				this.getAllMessages(data.response.messages[i].id);
		}		
}

messageProcessor.prototype.getDBMessageList = function() {
	var self = this
	this.t0 = new Date().getTime();
	this.connection.query('select * from groups where group_id = '+ this.id, 
		function(err, res, data) {
			if(err)
				console.log(err)
			else {
				self.t1 =new Date().getTime();
				if(self.debug)  console.log("Getting db messages took " + (self.t1-self.t0)/1000 + " seconds")
				self.filterDBMessages(res);
				
			}
		}
	);
}

messageProcessor.prototype.filterDBMessages = function(res) {
	this.t0 = new Date().getTime()
	console.log("Remove these " + res.length + " messages")
	for(var i=0; i<res.length; i++) {
		if(typeof this.messages[res[i].message_id] != 'undefined')
			delete this.messages[res[i].message_id];
	}
	
	console.log("Message to insert count: " + Object.keys(this.messages).length)
	
	this.t1 = new Date().getTime();
	if(this.debug) console.log("Filtering messages took ",(this.t1-this.t0)/1000, " seconds")

	var keys = Object.keys(this.messages);
	
	this.t0 = new Date().getTime();
	for(var i=0; i<keys.length; i++) {
		this.countWords(this.messages[keys[i]])
	}
	
	this.t1 = new Date().getTime();
	if(this.debug) console.log("Counting words took ",(this.t1-this.t0)/1000, " seconds")
		
	this.t0 = new Date().getTime();
	this.insertWords();
	this.t1 = new Date().getTime();
	if(this.debug) console.log("Inserting counted words took ",(this.t1-this.t0)/1000, " seconds\n")
}

messageProcessor.prototype.countWords = function(message) {
	var words = []
	if (message.text || message.attachments[0]){
		if(message.attachments[0] && message.attachments[0].type == "image") {
			words[0] = message.attachments[0].url;
		}
		if (message.text) {
			words = message.text.toLowerCase().replace(/[^0-9a-zA-Z+ ]/g, '').split(/[ +]/).filter(Boolean);
		}
		
		for(var i=0; i<words.length; i++) {
			if(typeof this.words[words[i]] == 'undefined')
				this.words[words[i]] = 1;
			else
				this.words[words[i]]++;
		}
		
		this.insertMessage(message, words.length);
	}
}

messageProcessor.prototype.insertMessage = function(message, length) {
	grouptuple = { group_id: this.id, group_name: this.name, message_id: message.id, message_length: length}
	this.connection.query('INSERT groups SET ?', grouptuple, function(err) {
		if(err) console.log(err)
	});
}

messageProcessor.prototype.insertWords = function() {
	var keys = Object.keys(this.words)
	
	this.insertCount = keys.length
	this.t0 = new Date().getTime()
	
	var bulk_insert_words = [];
	for(var i=0; i<keys.length; i++) {
		var temp_tuple = [];
		temp_tuple.push(keys[i]);
		temp_tuple.push(this.words[keys[i]]);
		bulk_insert_words.push(temp_tuple);
		// bulk_insert_words_gwc.push(temp_tuple);
		// var grouptuple = { group_id: this.id, word: keys[i], count: this.words[keys[i]] };
		// this.insert_word_gwc(grouptuple, grouptuple.count);
		// wordtuple = { word: keys[i], count: this.words[keys[i]] };
		// this.insert_word(wordtuple, wordtuple.count);
	}
	// for (var i=0; i < bulk_insert_words.length; i++) {
	// 	bulk_insert_words_gwc[i].push(this.id);
	// }
	// console.log(bulk_insert_words_gwc);
	if (bulk_insert_words.length > 0) {
		console.log(bulk_insert_words);
		// this.insert_word_gwc(bulk_insert_words_gwc);
		this.insert_word(bulk_insert_words);
	}
	var bulk_insert_words_gwc = [];

	// something weird happens with doing two arrays at once
	for(var i=0; i<keys.length; i++) {
		var temp_tuple = [];
		temp_tuple.push(keys[i]);
		temp_tuple.push(this.words[keys[i]]);
		temp_tuple.push(this.id);
		bulk_insert_words_gwc.push(temp_tuple);
	}

	if(bulk_insert_words_gwc.length > 0){
		this.insert_word_gwc(bulk_insert_words_gwc);
	}
}

messageProcessor.prototype.insert_word_gwc = function(grouptuple) {
	this.connection.query('INSERT INTO groupwordcount (word, count, group_id) VALUES  ? ON DUPLICATE KEY UPDATE count = count + VALUES(count)', [grouptuple], function(err){
			if (err) console.log(err);
		});
}

messageProcessor.prototype.insert_word = function(wordtuple){
	this.connection.query('INSERT wordcount (word, count) VALUES ? ON DUPLICATE KEY UPDATE count = count + VALUES(count)', [wordtuple], function(err) {
			if(err) console.log(err)
		});
}
// messageProcessor.prototype.insert_word = function(wordtuple){
// 	var self = this;
// 	this.connection.query('INSERT wordcount SET ? ON DUPLICATE KEY UPDATE count = count + ' + count, wordtuple, function(err) {
// 			if(err) console.log(err)
// 			else {
// 				self.insertFinished ++;
// 				if(self.insertFinished == self.insertCount ) {
// 					console.log("Finished inserting " + self.insertCount + " words")
// 					self.t1 = new Date().getTime()
// 					console.log("Inserting words took "  + (self.t1-self.t0)/1000 + " seconds")
// 				}
// 			}
// 		});
// }

module.exports = {
		messageProcessor: messageProcessor
};