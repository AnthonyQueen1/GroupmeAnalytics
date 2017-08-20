// index.get_tables.js
$(function(){
	var cur_group_name = '';
	$.get('/api/get-group-list', function(data){
		group_names = data;
		for (var i=0; i<group_names.length; i++){
			$('#groups-dropdown').append("<option value="+ group_names[i].group_id + ">" + group_names[i].group_name + "</option>");
		}
	});
	
	// on startup
	fillTable();

	setLabels();
	$('.selector').change(function(){
		fillTable();
		setLabels();
	})

	$('#remove-common')
});

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
