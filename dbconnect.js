// dbconnect.js
var request = require('request');
var mysql = require("mysql");
var url = "https://api.groupme.com/v3";
var getGroups = "/groups";
var getMessage = "/messages";
var duplicate = false;

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "theradio",
  database: "groupme"
});


var getdata = function (names, ids, token){

		for (var i=0; i<ids.length; i++){
			add_all_msg_to_db(names[i], ids[i], token, "");
		}
};


// params: name: group name, id: group id, token: access token, lastmessageid: id of last message inserted to db
var add_all_msg_to_db = function(name, id, token, lastmessageid) {
	console.log('===========getting messages from groupme api============');
	var requrl = 'https://api.groupme.com/v3/groups/'+ id + '/messages?token=' + token;
	var formdata = (lastmessageid) ? requrl + '&before_id=' + lastmessageid : requrl;	
	var final_message_id = '';
	// get 20 messages
	request.get(formdata, function (error, response, body) {
		if (error) console.log('error:', error);
		console.log('statusCode:', response && response.statusCode);
		messageData = JSON.parse(body);
		for (var i=0; i<messageData.response.messages.length; i++){
			select_message(name, id, messageData.response.messages[i]);
			//console.log(messageData.response.messages[i]);
			if (i==19){
				add_all_msg_to_db(name, id, token, messageData.response.messages[i].id);
			}
		}
	});
}


function select_message(name, id, message) {
	con.query('select group_id, message_id from groups where group_id = '+ id + ' and message_id = ' + message.id, 
		function(err, rows){
			if(err) console.log(err);
			if(rows.length == 0) {
				insert_data(name, id, message);
			} 
		}
	);
}

function insert_data(name, id, message) {
	console.log('===== beginning inserts =====')
	var words = []
	if(message.attachments[0] && message.attachments[0].type == "image"){ 
		words[0] = message.attachments[0].url;
	} else{
		if (message.text) {
			var txt = message.text.toLowerCase().replace(/[^0-9a-z ]/, '');
			// console.log(txt);

			words = txt.split(/[ +]/).filter(Boolean);
			console.log('words: ' + words);
		}
	}
	var grouptuple = {group_id: id, group_name: name, message_id: message.id, message_length: words.length};
	con.query('INSERT INTO groups SET ?', grouptuple, function(err){
		if (err) console.log(err);
	});
	for(var i=0; i<words.length; i++) {
		console.log(words[i]);
		con.query('Select * from groupwordcount where group_id=' + id + ' and word=\'' + words[i] + '\'', 
			function(err, rows) {
				if (err) console.log(err);
				if(rows.length == 0) {
					insert_group_word(name, id, words[i]);
				} else{
					increment_group_word(name, id, words[i]);
				}
			}
		);
		/*
		con.query('Select * from wordcount where word=' + words[i], 
			function(err, rows) {
				if(rows.length == 0)
					insertWord(words[i])
				else
					incrementWord(words[i])

			}
		);
		*/
	}
}

function insert_group_word(name, id, word) {
	grouptuple = {group_id: id, word: word, count: 1};
	con.query('insert groupwordcount set ?', grouptuple, function(err){
		if(err) console.log(err);
	});
}

function increment_group_word(name, id, word) {
	con.query('update groupwordcount count = count + 1 where word='+word+ ' and group_id=' + id, function(err){
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

