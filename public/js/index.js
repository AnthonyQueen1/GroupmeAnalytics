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
	fill_table();

	$('.selector').change(function(){
		fill_table();
	})

	$('#refresh-table').click(function(){
		fill_table();
	});
});

var fill_table = function() {
	var id = $('#groups-dropdown').val();
	var num = $('#num-rows').val();
	cur_group_name = $('#groups-dropdown').find(':selected').text();

	$("#table-body tr").remove();

	$.get('/groupme/api/word-counts/'+ id + '/' + num, function(data) {
		console.log (data)
		for (var i=0; i<data.length; i++) {
			
			var pattern = /^((http|https|ftp):\/\/)/;
			var string = "<tr><td> " + (i+1) + "</td><td>" 
			if(pattern.test(data[i].word)) 
				string += '<a href=\'' +data[i].word+'\' >' + data[i].word + '</a>';
			else 
				string += data[i].word;
			string += "</td><td> " + data[i].count + "</td></tr>";
			$('#table-body').append(string);
		}
	});
}
