// dbconnect.js
var processor = require('./messageProcessor')
var request = require('request');
var mysql = require("mysql");

var processes = []


var getdata = function (names, ids, token){
	for (var i=0; i<ids.length; i++){
		processes.push(new processor.messageProcessor(names[i], ids[i], token));
	}
};



//Old CODE

// params: name: group name, id: group id, token: access token, lastmessageid: id of last message inserted to db
var add_all_msg_to_db = function(name, id, token, lastmessageid) {
	// console.log('===========getting messages from groupme api============');
	var requrl = 'https://api.groupme.com/v3/groups/'+ id + '/messages?token=' + token;
	var formdata = (lastmessageid) ? requrl + '&before_id=' + lastmessageid : requrl;	
	var final_message_id = '';
	// get 20 messages
	request.get(formdata, function (err, response, body) {
		if (err) console.log('Error:', err);
		//console.log('statusCode:', response && response.statusCode);
		messageData = JSON.parse(body);
		if(message_count == 0) {
			t0 = new Date().getTime();
			message_count = messageData.response.count;
			console.log("First Message: " + message_count + " to go")
		}
		for (var i=0; i<messageData.response.messages.length; i++){
			select_message(name, id, messageData.response.messages[i]);
			message_count--
			if (i==19){
				add_all_msg_to_db(name, id, token, messageData.response.messages[i].id);
			}
		}
	});
}


function select_message(name, id, message) {
	pool.getConnection(function(err, con) {
		if(err) console.log(err)
		console.log('connected as id ' + con.threadId);
		con.query('select group_id, message_id from groups where group_id = '+ id + ' and message_id = ' + message.id, 
			function(err, rows){
				if(err) console.log(err);
				con.release();
				
				if(rows.length == 0) {
					insert_data(name, id, message);
				}
				if(message_count == 0) {
					console.log("Last Message")
					t1 = new Date().getTime();
					console.log("Call to add_all_msg_to_db took " + (t1 - t0)/1000 + " seconds.")
				}
			}
		);
	});
}

function insert_data(name, id, message) {
	// console.log('===== beginning inserts =====');
	var words = []
	if(message.attachments[0] && message.attachments[0].type == "image"){ 
		words[0] = message.attachments[0].url;
	} else{
		words = message.text.toLowerCase().replace(/[^0-9a-zA-Z+ ]/g, '').split(/[ +]/).filter(Boolean);
	}
	if (words){
		pool.getConnection(function(err, con) {
			if(err) console.log(err)
			var grouptuple = {group_id: id, group_name: name, message_id: message.id, message_length: words.length};
			con.query('INSERT INTO groups SET ?', grouptuple, function(err){
				if (err) console.log(err);
				con.release();
				
			});
			/*
			for(var i=0; i<words.length; i++) {
				select_words_gwc(name, id, words[i]);
				if(i==words.length-1 && message.id == last_id)
					last_word = words[i]
			}
			*/
		});
	}
}

function select_words_gwc(name, id, word){
	pool.getConnection(function(err, con) {
		if(err) console.log(err)
		con.query('Select * from groupwordcount where group_id=' + id + ' and word=\'' + word + '\'', 
			function(err, rows) {
				if (err) console.log(err);
				con.release();
				
				if(rows.length == 0) {
					// console.log('inside query: ' + word);
					insert_group_word(name, id, word);
				} else{
					if(last_word == word) 
						console.log("finished")
					// increment_group_word(name, id, word);
				}
			}
		);
	});
}

function insert_group_word(name, id, word) {
	// console.log('=== inserting '+word+' into groupwordcount === ');
	pool.getConnection(function(err, con) {
		if(err) console.log(err)
		grouptuple = {group_id: id, word: word, count: 1};
		con.query('insert groupwordcount set ? ON DUPLICATE KEY UPDATE count = count + 1;', grouptuple, function(err, result){
			if(err) console.log(err);
			if(result && word == last_word)
					console.log(result)
		});
	});
}

function increment_group_word(name, id, word) {
	con.query('update groupwordcount set count = count + 1 where word='+word+ ' and group_id=' + id, function(err){
		if (err) console.log(err);
	});
}


/* Extra Code 4 l8r


// if message is not empty
			// var exist_query = con.query('select message_id from Groups where group_id = '+ id + ' and message_id = ' + messageid);
			// exist_query
			// 	.on('error', function(err) {
			// 		console.log(err);
			// 	})
			// 	.on('result', function(row){
			// 		if(row) {
			// 			console.log(row);
			// 			finished = true;
			// 		} else console.log('no row');
			// 	});


			if (message && false) {
				// split into individual words
				words = message.split(/[ ,-.]+/).filter(Boolean);
				// make tuple to insert into db
				var grouptuple = {group_id: id, group_name: name, message_id: messageid, message_length: words.length};
				console.log(grouptuple);
				// insert tuple into db
				con.query('INSERT INTO groups SET ?', grouptuple, function(err, res){
					if (err) {
						console.log(err);
						throw err;
						return;
					}
					console.log('Last insert ID:', res.insertId);
				});
				for (j=0; j<words.length; j++){
					// console.log(words[j].toLowerCase());
					var tuple = {}
				}
			}
			// if (i==19 && !finished){
			// 	add_all_msg_to_db(name, id, token, messageData.response.messages[i].id);
			// }
			
			
			*/




module.exports = {
	getdata: getdata
};

