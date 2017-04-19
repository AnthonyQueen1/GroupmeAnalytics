// index.get_tables.js
$(function(){
	var cur_group_name = '';
	$.get('/groupme/api/group-list', function(data){
		group_names = data;
		for (var i=0; i<group_names.length; i++){
			$('#groups-dropdown').append("<option value="+ group_names[i].group_id + ">" + group_names[i].group_name + "</option>");
		}
	});
	
	// on startup
	fill_table();

	$('#refresh-table').click(function(){
		fill_table();
	});
});

var fill_table = function() {
	var id = $('#groups-dropdown').val();
	var num = $('#num-rows').val();
	cur_group_name = $('#groups-dropdown').find(':selected').text();

	$("#table-body tr").remove();

	$.get('/groupme/api/most-used-words/'+ id + '/' + num, function(data) {
		for (var i=0; i<data.length; i++) {
			$('#table-body').append(
				"<tr>" + 
					"<td> " + (i+1) + ".</td>" +
					"<td> " + data[i].word + "</td>" +
					"<td> " + data[i].count + "</td>" +
				"</tr>" );
		}
	});
}
