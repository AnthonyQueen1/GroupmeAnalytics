//Strips token off url
url = document.URL
url = url.split("token=").pop()
history.pushState(null, null, "user");

//changes url 
if(url == "https://antho.in/groupme/user")
	document.location =  url.split("user")[0]
else
	loadGroups(url)