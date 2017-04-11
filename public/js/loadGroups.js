function loadGroups(token) {
	$.get("https://api.groupme.com/v3/groups?token=" + token + "&per_page=500", 
		function(data) {
		console.log(data)
			for(var i=0; i<data.response.length; i++) {
				image_url = null;
				
				if(data.response[i].image_url == null)
					image_url = "https://antho.in/media/imagenotfound.svg";
				else
					image_url = data.response[i].image_url
				
				$(".result").append(
					"<div class='group'>" +
						"<input class='group-checkbox' type='checkbox' value='"+ data.response[i].group_id +"'> " +
						"<div class='group--info'>" +
							"<img class='group--image' heigh='120' width='120' src=" +  image_url + ">" +
							"<p class='group--info-name'>" + data.response[i].name + "</p>" + 
						"</div>" +
						"</input>" +
					"</div>"
				)
			}
			$(".group").click(function(){
					if($(this).hasClass("grayOut")){
						$(this).removeClass("grayOut");
						$(this).children()[0].checked = false;
						console.log($(this).children()[0].checked)
					}else{
						$(this).addClass("grayOut");
						$(this).children()[0].checked = true;
						console.log($(this).children()[0].checked)
					}
				});
		}
	);
}
