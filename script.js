url = "https://api.groupme.com/v3"
getGroups = "/groups"
getMessage = "/messages"
getBefore = "before_id="
token = "?token=19200d009c300133588c65865325a952"

//groupid = "21031117"

$.get("https://api.groupme.com/v3/groups?token=19200d009c300133588c65865325a952&per_page=500", 
	function(data) {
	console.log(data)
		for(var i=0; i<data.response.length; i++) {
			$(".result").append(
			"<div>" +
				"<img class='group-image' src=" + data.response[i].image_url + ">" +
				"<p>" + data.response[i].name + "</p>" +
			"</div>")
		}
	}
);