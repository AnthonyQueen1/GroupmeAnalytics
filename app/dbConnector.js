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
    if (err)  console.log(err)
    else {
      try {
        var parsedData = JSON.parse(data)
        callback.call(object, parsedData)
      } catch (e) {
        console.log(e)
      }
    }
  })
}

dbConnector.prototype.getGroupMessages = function(object, callback) {
  this.connection.query('select * from groupmessages where group_id = '+ object.id, 
    function(err, res, data) {
      if(err) console.log(err)
      else {
        if(object.debug) {
          object.t1 =new Date().getTime();
          console.log("\nGetting db messages took " + (object.t1-object.t0)/1000 + " seconds")
        }
        callback.call(object,  res);  
      }
    }
  );
}

dbConnector.prototype.insertGroup = function(object, group) {
  console.log(group)
  this.connection.query('INSERT IGNORE groupname (group_id, group_name) VALUES ?', [[group]], function(err) {
    if(err) {
      console.log("\nError inserting Group: " + group + "\n")
      console.log(err)
    }
  });
}

dbConnector.prototype.insertBulkMessages = function(object, messages) {
  this.connection.query('INSERT IGNORE groupmessages (group_id, message_id) VALUES ?', [messages], function(err) {
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
  this.connection.query('INSERT INTO wordcount (message_id, word, count) VALUES ? ON DUPLICATE KEY UPDATE count = count + VALUES(count)', [wordtuples], function(err) {
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
	console.log	(grouptuples[1])
  this.connection.query('INSERT INTO groupwordcount (group_id, group_name) VALUES ?', [grouptuples], function(err){
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

dbConnector.prototype.getMostUsedWords = function(id, limit, callback) {
  var limit = (limit<=500) ? limit: 50;
  if (id == 'all'){
    this.connection.query('SELECT word, sum(count) AS count FROM wordcount wc GROUP BY wc.word ORDER BY count DESC, word ASC LIMIT  '+ limit, callback);
  } else {
    this.connection.query('SELECT word, sum(count) AS count FROM wordcount wc NATURAL JOIN groupmessages gm  where group_id =  ' + id + ' GROUP BY word ORDER BY count DESC, word ASC LIMIT ' + limit, callback);
  }
}

dbConnector.prototype.filterOutCommonCase = function(id, limit, callback){
  var limit = (limit<=500) ? limit: 50;
  if (id == 'all'){
    this.connection.query('SELECT wc.word, sum(wc.count) AS count FROM wordcount wc  WHERE wc.word NOT IN (   SELECT common_word FROM commonCase   ) GROUP BY wc.word ORDER BY count DESC, word ASC  LIMIT '+ limit, callback);
  } else {
    this.connection.query('SELECT wc.word, sum(wc.count) AS count FROM wordcount wc NATURAL JOIN groupmessages gm  WHERE wc.word NOT IN (   SELECT common_word FROM commonCase   ) AND gm.group_id =' + id + ' GROUP BY wc.word ORDER BY count DESC, word ASC  LIMIT ' + limit, callback);
  }
}

dbConnector.prototype.getGroupList = function(callback) {
  this.connection.query('SELECT * FROM groupname ORDER BY group_name ASC', callback);
};

dbConnector.prototype.getTotalGroups = function(callback) {
  this.connection.query('SELECT COUNT(*) AS count FROM groupname', callback);
};

dbConnector.prototype.getTotalMessages = function(callback) {
  this.connection.query('SELECT COUNT(*) AS count FROM groupmessages', callback);
};

dbConnector.prototype.getTotalWords = function(callback) {
  this.connection.query('SELECT sum(count) AS count FROM wordcount', callback);
};

module.exports = new dbConnector();
