function loadGroups(token) {
	$.get("https://api.groupme.com/v3/groups?token=" + token + "&per_page=500", 
		function(data) {
			for(var i=0; i<data.response.length; i++) {
				image_url = null;
				
				if(data.response[i].image_url == null)
					image_url = "/media/imagenotfound.svg";
				else
					image_url = data.response[i].image_url
				
				$(".result").append(
					"<div class='group' id='" + i + "'>" +
						"<input class='group-checkbox' type='checkbox'> " +
						"<div class='group--info'>" +
							"<img class='group--image' heigh='120' width='120' src=" +  image_url + ">" +
							"<p class='group--info-name'>" + data.response[i].name + "</p>" + 
						"</div>" +
						"</input>" +
					"</div>"
				);
			}
			
			$(".group").click(function(){
				if($(this).hasClass("grayOut")){
					$(this).removeClass("grayOut");
				}else{
					$(this).addClass("grayOut");
				}
			});
			
			$("#select-all").click(function() {
				var groups = $(".group");
				for(var i=0; i<groups.length; i++) {
					if(!$(groups[i]).hasClass("grayOut"))
						$(groups[i]).addClass("grayOut")
				}
			});
			
			$("#submit-button").click(function(){
				var groups = $('.grayOut');
				if(groups.length != 0){
					var to_send = {ids: [], names: [], token: token};
					for (var j=0; j<groups.length; j++){
						to_send.ids.push(data.response[groups[j].id].group_id);
						to_send.names.push(data.response[groups[j].id].name);
					}
					console.log(to_send)
					$.post('/api/word-counts', to_send, function() {
            //redirects
            window.location.replace("/");
          });
        }
			});
		}
	);
}
