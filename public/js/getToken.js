url = document.URL
url = url.split("token=").pop()
history.pushState(null, null, "user");

if(url == "https://antho.in/user")
	document.location =  url.split("user")[0]
else
	loadGroups(url)