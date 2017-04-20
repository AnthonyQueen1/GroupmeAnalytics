// index.get_tables.js
$(function(){
	var cur_group_name = '';
	$.get('/groupme/api/get-group-list', function(data){
		group_names = data;
		for (var i=0; i<group_names.length; i++){
			$('#groups-dropdown').append("<option value="+ group_names[i].group_id + ">" + group_names[i].group_name + "</option>");
		}
	});
	
	// on startup
	fillTable();

	$('.selector').change(function(){
		fillTable();
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
		$.get('/groupme/api/word-counts/'+ id + '/' + num + '/common', fillTableHelp);
	} else {
		$.get('/groupme/api/word-counts/'+ id + '/' + num, fillTableHelp);
	}
}

var fillTableHelp = function(data){
	for (var i=0; i<data.length; i++) {
			
			var pattern = /^((http|https|ftp):\/\/)/;
			var string = "<tr><td> " + (i+1) + "</td><td>" 
			if(pattern.test(data[i].word)) {
				string += '<a href=\'' +data[i].word+'\' >' + data[i].word + '</a>';
			} else { 
				string += data[i].word;
			}
			string += "</td><td> " + data[i].count + "</td></tr>";
			$('#table-body').append(string);
		}
}
