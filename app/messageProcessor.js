// groupProcessor.js
var connection = require('./dbConnector.js')

var processes = []

var uploadData = function (names, ids, token) {
	console.log('Processing groups: '+ names)
	for (var i=0; i<ids.length; i++){
		processes.push(new groupProcessor(names[i], ids[i], token));
	}
};

function groupProcessor(name, id, token) {
    this.name = name;
    this.id = id;
    this.token = token;
	this.message_count = 0;
	this.messages = {};
	this.words = {};
	this.getAllMessages('');
	
	//debugging
	this.debug = true;
	this.t0 = new Date().getTime();
	this.t1 = 0;	
}

groupProcessor.prototype.getAllMessages = function(lastmessageid) {
	connection.getAllMessages(this, lastmessageid, this.addGMMessagesToList);
}

groupProcessor.prototype.addGMMessagesToList = function(data) {
		if(this.message_count == 0) {
			this.message_count = data.response.count;
			connection.insertGroup(this, [parseInt(this.id), this.name])
			if(this.debug) console.log("Meesages to get: ",this.message_count)
		}
	
		for (var i=0; i<data.response.messages.length; i++){
			this.message_count--;
			this.messages[data.response.messages[i].id] = data.response.messages[i];
			if(this.message_count == 0) {
				this.t1 = new Date().getTime();
				if(this.debug) {
					console.log("Getting groupme messages took ",(this.t1-this.t0)/1000, " seconds")
					this.t0 = new Date().getTime();
				}
				//Step 2 Filtering
				connection.getGroupMessages(this, this.filterDBMessages);
			}
				
			if (i==data.response.messages.length-1 && this.message_count > 0) 
				this.getAllMessages(data.response.messages[i].id);
		}		
}

groupProcessor.prototype.filterDBMessages = function(res) {
	if(this.debug) {
		console.log("Remove these " + res.length + " messages")		
		this.t0 = new Date().getTime()
	}
	//Remove duplicate messages
	for(i=0; i<res.length; i++) {
		delete this.messages[res[i].message_id]
	}

	
	if(this.debug)  {
		console.log("Filtering messages took ",(this.t1-this.t0)/1000, " seconds") 
		this.t1 = new Date().getTime();
		console.log("Message to insert count: " + Object.keys(this.messages).length)	
	}
	
	//Count Words to insert
	var keys = Object.keys(this.messages)
	
	this.t0 = new Date().getTime()
	for(var i=0; i<keys.length; i++) {
		this.countWords(this.messages[keys[i]], keys[i])
	}
	
	if(this.debug) {
		this.t1 = new Date().getTime()
		console.log('Counting ' + Object.keys(this.words).length + ' words took ' + (this.t1-this.t0)/1000 + " seconds")
		this.t0 = new Date().getTime()
	}

	this.insertWords()
	this.insertGroupMessages()
}

groupProcessor.prototype.countWords = function(message, message_id) {
	var message_words = []
	if (message.text){
		message_words = message.text.toLowerCase().replace(/[^0-9a-zA-Z+ ]/g, '').split(/[ +]/).filter(Boolean);
		this.words[message_id] = {}
		for(var i=0; i<message_words.length; i++) {
			if(typeof this.words[message_id][message_words[i]] == 'undefined')
				this.words[message_id][message_words[i]] = 1
			else
				this.words[message_id][message_words[i]]++
		}
		
		this.messages[message.id].length = message_words.length;
	}
}

groupProcessor.prototype.insertWords = function() {
	var message_ids = Object.keys(this.words)
	var bulk_words = [];
	for (m_id in this.words) {
		for (word in this.words[m_id]) {
			var temp_tuple = []
			temp_tuple.push(m_id)
			temp_tuple.push(word)
			temp_tuple.push(this.words[m_id][word])
			bulk_words.push(temp_tuple)
		}			
	}
	if (bulk_words.length > 0) 
		connection.insertBulkWords(this, bulk_words);
}

groupProcessor.prototype.insertGroupMessages = function() {
	var keys = Object.keys(this.messages)
	
	var bulk_messages = [];
	for(var i=0; i<keys.length; i++) {
		var temp_tuple = [];
		temp_tuple.push(parseInt(this.id));
		temp_tuple.push(keys[i]);
		likes = (typeof this.messages[keys[i]] != 'undefined') ? this.messages[keys[i]].favorited_by.length : 0
		temp_tuple.push(likes)
		bulk_messages.push(temp_tuple);			
	}
	
	if (bulk_messages.length > 0) 
		connection.insertBulkMessages(this, bulk_messages);
	
}

module.exports = {
		uploadData: uploadData
};