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

// Shows the login popup if called
function showlogin() {
	document.getElementById("loginpopup").style.display = "block";
}

function hidelogin() {
	document.getElementById("loginpopup").style.display = "none";
}

window.addEventListener("load", function(){
    document.getElementById("login").addEventListener("submit", (evt) => {
        // Prevents the default page reload action when pressing a submit button
        evt.preventDefault();
        // assigns the password and username fields to variables
        var password = document.getElementById("password").value;
		var username = document.getElementById("username").value;

		// Client side validation
        if (username == "") {
            document.getElementById("infobox_text").innerHTML = "You can't have no username.";
            document.getElementById("infobox").style.transform = "translate(-50%,0)";
            setTimeout(() => { document.getElementById("infobox").style.transform = "translate(-50%,+150%)"; }, 3000);
            return;
        }

        if (password == "") {
            document.getElementById("infobox_text").innerHTML = "Passwords cannot be blank.";
            document.getElementById("infobox").style.transform = "translate(-50%,0)";
            setTimeout(() => { document.getElementById("infobox").style.transform = "translate(-50%,+150%)"; }, 3000);
            return;
        }

		// base url
		let base = "https://"+ tld + "/noelsgame/";
		// Data to be sent
		let reqdata = {
			"username": username,
			"password": password
		};
		// Parameters for fetch
		let fetchData = {
			method: "post",
			body: JSON.stringify(reqdata),
			headers: { "Accept": "application/json", "Content-Type": "application/json" },
			credentials: 'include'
		};
		// Use fetch on /authenticate route and pass response
		fetch(base + "authenticate", fetchData)
			.then(res => res.json())
			.then(data => {
				if (data.status == "success") {
					//console.log("User login success.");
					hidelogin();
					// Set input boxes blank
					document.getElementById("password").value = "";
					document.getElementById("username").value = "";
                	document.getElementById("content").style.display = "block";
                	if (window.location.pathname.includes("game.html")) {
                    	getgame();
                    	document.getElementById("heading").innerHTML = "Hello "+ data.charAt(0).toUpperCase() + data.slice(1) + ", welcome to Noel's Music Quiz Game";
                    }
				}
				if (data.status == "failed") {
					// If the user did not enter correct details, set info box to tell them to try again
					if (data.message == "invalusrorpwd") {
						document.getElementById("infobox_text").innerHTML = "Incorrect username or password, try again.";
						// Set input boxes blank
						document.getElementById("password").value = "";
						document.getElementById("username").value = "";
					}
					// Set info box to tell user about server issues
					else {
						document.getElementById("infobox_text").innerHTML = "Internal server offline: tell us!";
						// Set input boxes blank
						document.getElementById("password").value = "";
						document.getElementById("username").value = "";
					}
					// Move infobox and then move it down after it's read
					document.getElementById("infobox").style.transform = "translate(-50%,0)";
					setTimeout(() => { document.getElementById("infobox").style.transform = "translate(-50%,+150%)"; }, 3000);
				}
				//console.log("Login function executed.");
			})
			.catch(function (error) {
				document.getElementById("infobox_text").innerHTML = "Internal server issues: tell us!";
				document.getElementById("infobox").style.transform = "translate(-50%,0)";
				setTimeout(() => { document.getElementById("infobox").style.transform = "translate(-50%,+150%)"; }, 3000);
			});
	});

	document.getElementById("createaccount").addEventListener("click", () => {
		// Creates a cookie which has the page that the user came from when they click the create account button, deleted when the user agent is closed
		document.cookie = "createaccountlink=" + window.location.href;
		window.location.assign("createaccount.html");
	});

});

// Set your top level domain or url
const tld = "";