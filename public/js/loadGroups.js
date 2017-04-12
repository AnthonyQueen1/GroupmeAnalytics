function loadGroups(token) {
	$.get("https://api.groupme.com/v3/groups?token=" + token + "&per_page=500", 
		function(data) {
		console.log(data)
			var to_send = {ids: [], names: [], token: token};
			for(var i=0; i<data.response.length; i++) {
				image_url = null;
				
				if(data.response[i].image_url == null)
					image_url = "https://antho.in/media/imagenotfound.svg";
				else
					image_url = data.response[i].image_url
				
				$(".result").append(
					"<div class='group' id='" + i +  "'>" +
						"<input class='group-checkbox' type='checkbox' value='"+ data.response[i].group_id +"'> " +
						"<div class='group--info'>" +
							"<img class='group--image' heigh='120' width='120' src=" +  image_url + ">" +
							"<p class='group--info-name'>" + data.response[i].name + "</p>" + 
						"</div>" +
						"</input>" +
					"</div>"
				);
			}
			$(".result").append(
				 '<button type="button" class="btn" id="submit-button">submit</button>'
				);
			$(".group").click(function(){
				if($(this).hasClass("grayOut")){
					$(this).removeClass("grayOut");
					$(this).children()[0].checked = false;
					var index = $(this).attr('id');
					console.log(index);
					if (index > -1) {
					    to_send.ids.splice(index, 1);
					    to_send.names.splice(index, 1);
					}
					console.log(to_send);
				}else{
					$(this).addClass("grayOut");
					$(this).children()[0].checked = true;
					var index = $(this).attr('id');
					to_send.ids.push(data.response[index].group_id);
					to_send.names.push(data.response[index].name);

					console.log(to_send);
				}
			});
			$("#submit-button").click(function(){
				console.log(to_send);
				if(to_send.ids) $.post('/groupme/api/get-all-word-counts/', to_send)
			});
		}
	);
}
