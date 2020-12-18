let fetchData = {
	method: "post",
	headers: { "Accept": "application/json", "Content-Type": "application/json" },
	credentials: "include"
};

// Function to play the game
async function checkfortoken() {
	return new Promise(function(resolve, reject) {
		// Sends an empty request to the api, if a valid token is included, it will reply with true, else false.
		fetch("https://" + tld  + "/noelsgame/checklogin", fetchData)
			.then(res => res.json())
			.then(data => {
				if (data.response == false) {
            		resolve(false);
            	}
				else {
            		resolve(true);
            	}
		});
    })	
}

// Set your top level domain or url
const tld = "";
