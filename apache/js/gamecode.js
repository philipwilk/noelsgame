window.addEventListener("load", function(){
	functionwrapper();
	document.getElementById("song_submit").addEventListener("submit", function(evt){
    	evt.preventDefault();
    });
});

async function functionwrapper(){
	return new Promise(function(resolved, rejected) {
    	let isloggedin = checkfortoken();
		resolved(isloggedin);
    	})
		// Data is true or false depending on whether a valid token is found
		.then(function(data) {
            if (!data) {
        		//console.log("No one is logged in");
        		showlogin();
    		}
    		else {
            	getgame();
        		//console.log("someone is logged in");
            	document.getElementById("content").style.display = "block";
            	return new Promise(function(resolve, reject) {
                	// Gets username by sending a request with the token to the server
                	let usernameid = getusername();
                	resolve(usernameid);
                }).then(function(data){
                	document.getElementById("heading").innerHTML = "Hello "+ data.charAt(0).toUpperCase() + data.slice(1) + ", welcome to Noel's Music Quiz Game";
                });
    	}
    });
};

// Returns the username from an active token, else returns false or rejects
async function getusername() {
	return new Promise(function(resolve, reject) {
    	let fetchData = {
			method: "post",
			headers: { "Accept": "application/json", "Content-Type": "application/json" },
			credentials: "include"
		};
		fetch("https://" + tld + "/noelsgame/getusername", fetchData)
			.then(res => res.json())
			.then(data => {
    			if (data.status == "fail") {
            		if (data.message == "usernamenotfound") {
                		//console.log("User not found: you need to log in.");
                		resolve(false);
                	}
               		else {
                    	reject();
                    }
            	}
    			else {
            		//console.log("Your username is", data.username);
            		resolve(data.username);
            	}
		});
    });
	
}

// Returns the creation date of user id from an active token, else returns false or rejects
async function getusercreationdate() {
	return new  Promise(function(resolve, reject) {
    	let fetchData = {
			method: "post",
			headers: { "Accept": "application/json", "Content-Type": "application/json" },
			credentials: "include"
		};
		fetch("https://" + tld + "/noelsgame/getusercreationdate", fetchData)
			.then(res => res.json())
			.then(data => {
	    		if (data.status == "fail") {
	            	if (data.message == "usernamenotfound") {
	                	//console.log("User not found: you need to log in.");
                    	resolve(false);
	                }
                	reject();
	            }
	    		else {
	            	//console.log("Your username was created on", data.date);
                	resolve(data.date);
	            }
		});
    });
}

async function getgame() {
	return new Promise(function(resolve, reject) {
    	let fetchData = {
        	method: "post",
        	headers: { "Accept": "application/json", "Content-Type": "application/json" },
        	credentials: "include"
        };
    	
    	fetch("https://" + tld + "/noelsgame/game", fetchData)
    		.then(res => res.json())
    		.then(data => {
        		getgameinfo();
        		document.getElementById("song_name").innerHTML = data.name;
        		document.getElementById("release_date").innerHTML = "Release date: " + data.release;
        		if (data.artists.length > 1) {
                	document.getElementById("artist_name").innerHTML = data.artists.join(", ");
                	resolve();
                }
        		else {
                	document.getElementById("artist_name").innerHTML = data.artists.join("");
                	resolve();
                }
        });
    });
}

// Get lives and points for current game at page load
async function getgameinfo() {
	return new Promise(function(resolve, reject) {
    	let fetchData = {
        	method: "post",
        	headers: { "Accept": "application/json", "Content-Type": "application/json" },
        	credentials: "include"
        };
    
    	fetch("https://" + tld + "/noelsgame/getgameinfo", fetchData)
    		.then(res => res.json())
    		.then(data => {
        		document.getElementById("lives").innerHTML = "Lives: " + data.lives;
                document.getElementById("score").innerHTML = "Points: " +data.points;
        });
    });
}

async function submitgame() {
	return new Promise((resolve, reject) => {
    	// Check if the input box for submitting the game isn't empty
    	if (document.getElementById("input_box").value == "") {
        	document.getElementById("infobox_text").innerHTML = "You need to write something!";
            document.getElementById("infobox").style.transform = "translate(-50%,0)";
            setTimeout(() => { document.getElementById("infobox").style.transform = "translate(-50%,+150%)"; }, 3000);
            return;
        }
    	
    	let reqdata = { guess : document.getElementById("input_box").value };
    	document.getElementById("input_box").value = "";
    
    	let fetchData = {
        	method: "post",
        	headers: { "Accept": "application/json", "Content-Type": "application/json" },
        	credentials: "include",
        	body: JSON.stringify(reqdata)
        };
    
    	fetch("https://" + tld + "/noelsgame/songsubmit", fetchData)
    		.then(res => res.json())
    		.then(async function(data) {
        		console.log(data);
        		console.log(data.status);
        		switch(data.status){
                	case "nogamefound":
						getgame();
                		document.getElementById("infobox_text").innerHTML = "Making a new game for you..";
            			document.getElementById("infobox").style.transform = "translate(-50%,0)";
            			setTimeout(() => { document.getElementById("infobox").style.transform = "translate(-50%,+150%)"; }, 3000);
            			return;
                	case "gameover":
						getgame();
                		document.getElementById("infobox_text").innerHTML = "You ran out of lives, making new game..";
            			document.getElementById("infobox").style.transform = "translate(-50%,0)";
            			setTimeout(() => { document.getElementById("infobox").style.transform = "translate(-50%,+150%)"; }, 3000);
                		return;
                	case "incorrect":
                		document.getElementById("lives").innerHTML = "Lives: " + data.lives;
                		document.getElementById("infobox_text").innerHTML = "Incorrect, try again..";
            			document.getElementById("infobox").style.transform = "translate(-50%,0)";
            			setTimeout(() => { document.getElementById("infobox").style.transform = "translate(-50%,+150%)"; }, 3000);
                		return;
                	case "correct":
                		document.getElementById("lives").innerHTML = "Lives: " + data.lives;
                		document.getElementById("score").innerHTML = "Points: " + data.points;
                		getgame();
                	case "finished":
                		document.getElementById("infobox_text").innerHTML = "Game finished, making new game.";
                		document.getElementById("lives").innerHTML = "Lives: " + data.lives;
                		document.getElementById("score").innerHTML = "Points: " + data.points;
                        setTimeout(function(){ getgame(); }, 3000);
                }
        	});
    
    });
}

function gotoscoreboard(){
    window.location.href = "scoreboard.html";
}

// Set your top level domain or url
const tld = "";