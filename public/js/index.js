// index.get_tables.js
$(function(){
	$(".login-button").load("oauth.html");
	var cur_group_name = '';
	$('#loading').show();
	$.get('/api/get-group-list', function(data){
		$('#loading').hide()
		group_names = data;
		for (var i=0; i<group_names.length; i++){
			$('#groups-dropdown').append("<option value="+ group_names[i].group_id + ">" + group_names[i].group_name + "</option>");
			$('#groups-dropdown-lda').append("<option value="+ group_names[i].group_id + ">" + group_names[i].group_name + "</option>");
		}
	});
	
	// on startup
	fillTopics(10311087)
	fillTable();

	setLabels();
	$('.selector').change(function(){
		fillTable();
	});

	$('.lda-selector').change(function() {
		fillTopics();
	});

	$('#remove-common')
});

function fillTopics(default_id) {
	var id = (default_id) ? default_id : $('#groups-dropdown-lda').val()
	$('#topics div').remove()
	$.get('/api/lda?group_id=' + id, fillTopicsHTML)
}

function fillTopicsHTML(data) {
	var words_per_topic = $('#num-rows-lda').val();
	html_string = ""
	for (var topic_num=0; topic_num<data.length; topic_num++) {
		var topic = data[topic_num]
		if (!topic) continue
		topic_html_string = ''
		for (var i=0; i<words_per_topic; i++ ) {
			topic_html_string += fillTopicLine(topic[i][0], topic[i][1])
		}
		html_string += fillTopicPanel(topic_html_string, topic_num+1)
	}
	addTopicsPanelGroup(html_string)
}

function addTopicsPanelGroup(html) {

	console.log('adding topics')
	$('#topics').append(html)
}

function fillTopicPanel(topics, topic_num) {
	return '<div class="col-md-4"><div class="panel panel-default"><div class="panel-heading">Topic ' + topic_num + '</div><div class="panel-body">' + topics + '</div></div></div>'
}

function fillTopicLine(word, lambda) {
	return '<h4>' + word + ' <div class="lambda">' + lambda + '</div class="lambda"></h4>'
}

var fillTable = function() {
	var id 				= $('#groups-dropdown').val();
	var num 			= $('#num-rows').val();
	var cur_group_name 	= $('#groups-dropdown').find(':selected').text();
	var remove_common	= $('#chk-remove-common')[0].checked;

	$("#table-body tr").remove();

	if (remove_common){
		$.get('/api/word-counts/'+ id + '/' + num + '/common', fillTableHelp);
	} else {
		$.get('/api/word-counts/'+ id + '/' + num, fillTableHelp);
	}
}


var fillTableHelp = function(data){
	for (var i=0; i<data.length; i++) {
			var string = "<tr><td> " + (i+1) + "</td><td>" 
			string += data[i].word;
			string += "</td><td> " + data[i].count + "</td></tr>";
			$('#table-body').append(string);
		}
}

var setLabels = function(){
	$.get('/api/total-groups', function(data){
		$('#total-groups').text('Total groups: ' + data[0].count)
	});
	$.get('/api/total-messages', function(data){
		$('#total-messages').text('Total messages: ' + data[0].count)
	});
	$.get('/api/total-words', function(data){
		$('#total-words').text('Total words: ' + data[0].count)
	});
}
