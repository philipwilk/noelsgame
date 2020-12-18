// Thanks to https://stackoverflow.com/users/388639/michael-martin-smucker @ https://stackoverflow.com/a/25352300/9413954
function isalphanume(str) {
    var code, i, len;
    for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)) { // lower alpha (a-z)
          return false;
        }
      }
      return true;
}

// Thanks to https://www.quirksmode.org/js/cookies.html for cookie codes
function createcookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
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
	createCookie(name,"",-1);
}
// End of cookie codes

window.addEventListener("load", function(){
	document.getElementById("createaccount").addEventListener("submit", (evt) => {
        evt.preventDefault();
        // assigns the password and username fields to variables
        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;
        var passwordconfirmation = document.getElementById("passwordconfirmation").value;

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

        if (password != passwordconfirmation) {
            document.getElementById("infobox_text").innerHTML = "Password submitted needs to be the same.";
            document.getElementById("infobox").style.transform = "translate(-50%,0)";
            setTimeout(() => { document.getElementById("infobox").style.transform = "translate(-50%,+150%)"; }, 3000);
            return;
        }

        // Checks if the user's input is alphanumeric client side

        if (!isalphanume(username)) {
            document.getElementById("infobox_text").innerHTML = "Please only use alphanumeric in username.";
            document.getElementById("infobox").style.transform = "translate(-50%,0)";
            setTimeout(() => { document.getElementById("infobox").style.transform = "translate(-50%,+150%)"; }, 3000);
            return;
        }

        // base url
        let base = "https://" + tld + "/noelsgame/";
        // Data to be sent
        let reqdata = {
            "username": username,
            "password": password
        };
        // Parameters for fetch
        let fetchData = {
            method: "post",
            body: JSON.stringify(reqdata),
            headers: { "Accept": "application/json", "Content-Type": "application/json" }
        };

        // use fetch on /createaccount and pass response
        fetch(base + "createaccount", fetchData)
            .then(res => res.json())
            .then(data => {
                if (data.status == "success") {
					console.log("Created user " + data.username + ".");
					// Set input boxes blank
					document.getElementById("password").value = "";
                    document.getElementById("username").value = "";
                    document.getElementById("passwordconfirmation").value = "";
                    var urltogoto = readcookie("createaccountlink");
                    window.location.replace(urltogoto);
                }
                if (data.status == "failed") {
					console.log("User creation failed.");
					// If the username is already taken
					if (data.error == "userexists") {
						document.getElementById("infobox_text").innerHTML = "This username is already taken!";
						document.getElementById("username").value = "";
						document.getElementById("password").value = "";
						 document.getElementById("passwordconfirmation").value = "";
						document.getElementById("infobox").style.transform = "translate(-50%,0)";
						setTimeout(() => { document.getElementById("infobox").style.transform = "translate(-50%,+150%)"; }, 3000);
					}
                }
            })
            .catch(function (error) {
				// Any other error
				document.getElementById("infobox_text").innerHTML = "Internal server issues: tell us!";
				document.getElementById("infobox").style.transform = "translate(-50%,0)";
				setTimeout(() => { document.getElementById("infobox").style.transform = "translate(-50%,+150%)"; }, 3000);
				
			});
        
    });
});

// Set your top level domain or url
const tld = "";