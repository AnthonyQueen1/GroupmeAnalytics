// dbconnect.js
var processor = require('./messageProcessor')

var processes = []

var uploadData = function (names, ids, token){
	console.log(names);
	for (var i=0; i<ids.length; i++){
		processes.push(new processor.messageProcessor(names[i], ids[i], token));
	}
};

module.exports = {
	uploadData: uploadData
};

