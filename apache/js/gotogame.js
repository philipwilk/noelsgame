// Thanks to https://www.quirksmode.org/js/cookies.html for cookie codes
function createcookie(name,value,days,arguments) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+";"+ arguments+"path=/;";
}

function readcookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function erasecookie(name) {
	createcookie(name,"",-1);
}
// End of cookie codes

function gotogame(){
    window.location.href = "game.html";
}

	