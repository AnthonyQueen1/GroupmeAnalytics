var request = require('request');
var mysql = require("mysql");

function messageProcessor(name, id, token) {
    this.name = name;
    this.id = id;
    this.token = token;
	this.message_count = 0;
	this.messages = {};
	this.getAllMessages('');
	this.connection = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "theradio",
		database: "groupme"
	});
	
	
	//debugging
	this.t0 = new Date().getTime();
	this.t1 = 0;
	//this.request = require('request');
	//this.mysql = require("mysql");
	
}

messageProcessor.prototype.getAllMessages = function(lastmessageid) {
	var requrl = 'https://api.groupme.com/v3/groups/'+ this.id + '/messages?token=' + this.token + '&limit=100';
	var formdata = (lastmessageid) ? requrl + '&before_id=' + lastmessageid : requrl;
	var self = this;
	request.get(formdata, function(err, res, data) {
		self.addGMMessagesToList(data)
	})
}

messageProcessor.prototype.addGMMessagesToList = function(data) {
		data = JSON.parse(data)
		if(this.message_count == 0) {
			this.message_count = data.response.count;
			console.log("Meesages to process: ",this.message_count)
		}
		for (var i=0; i<data.response.messages.length; i++){
			this.message_count--;
			this.messages[data.response.messages[i].id.toString()] = data.response.messages[i];
			if(this.message_count == 0) {
				console.log("Processed: ",this.messages.length, " messages")
				this.t1 = new Date().getTime();
				console.log("Processing took ",(this.t1-this.t0)/1000, " seconds")
				//Step 2 Filtering
				this.getDBMessageList(this.handleDBMessageList);
			}
			//insertMessage(this.messages[data.response.messages[i].id])
				
			if (i==data.response.messages.length-1 && this.message_count > 0) {
				this.getAllMessages(data.response.messages[i].id);
			}
		}		
}

messageProcessor.prototype.getDBMessageList = function(callback) {
	var self = this
	this.t0 = new Date().getTime();
	this.connection.query('select * from groups where group_id = '+ this.id + ' order by message_id ASC limit 100', 
		function(err, res, data) {
			if(err)
				console.log(err)
			else {
				self.t1 =new Date().getTime();
				console.log("Getting gm messages took ",(self.t1-self.t0)/1000, " seconds")
				self.filterDBMessages(res);
				
			}
		}
	);
}

messageProcessor.prototype.filterDBMessages = function(res) {
	this.t0 = new Date().getTime()
	for(var i=0; i<res.length; i++) {
		if(typeof this.messages[res[i].message_id] != 'undefined') {
			console.log("Remove this message: " + this.messages[res[i].message_id])
		}
	}
	this.t1 = new Date().getTime();
	console.log("Filtering messages took ",(this.t1-this.t0)/1000, " seconds")
}

messageProcessor.prototype.insertMessage = function(message) {
	var words = []
	if(message.attachments[0] && message.attachments[0].type == "image"){ 
		words[0] = message.attachments[0].url;
	} else{
		words = message.text.toLowerCase().replace(/[^0-9a-zA-Z+ ]/g, '').split(/[ +]/).filter(Boolean);
	}
	if (words){
		var grouptuple = {group_id: this.id, group_name: this.name, message_id: message.id, message_length: words.length};
		this.connection.query('INSERT INTO groups SET ?', grouptuple, function(err){
				if (err) console.log(err);	
			});
			/*
			for(var i=0; i<words.length; i++) {
				select_words_gwc(name, id, words[i]);
				if(i==words.length-1 && message.id == last_id)
					last_word = words[i]
			}
			*/
	}
}

module.exports = {
		messageProcessor: messageProcessor
};