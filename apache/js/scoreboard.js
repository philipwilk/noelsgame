async function getscoreboard5() {
	return new Promise(async function(resolve, reject){
    	let fetchData = {
        	method: "post",
        	headers: { "Accept": "application/json", "Content-Type": "application/json" },
        	credentials: "include"
        };
    
    	fetch("https://"+ tld + "/noelsgame/scoreboard5", fetchData)
    		.then(res => res.json())
    		.then(data => {
        		for (i=0; i<5; i++) {
                	document.getElementById("name"+i).innerHTML = data.games[i].username + " : " + data.games[i].points;
                	//document.getElementById("score"+i).innerHTML = data.games[i].points;
                	console.log(data.games[i].points, data.games[i].username);
                };
        	});
    });
}

window.addEventListener("load", function(){
	getscoreboard5();
});


// Set your top level domain or url
const tld = "";