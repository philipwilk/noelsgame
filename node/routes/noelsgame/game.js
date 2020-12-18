// Load mongoose
var mongoose = require("mongoose");

// Load other dependencies
var songmodel = require("./models.js").songmodel;
var gamemodel = require("./models.js").gamemodel;
var usermodel = require("./models.js").usermodel;

async function creategame(userid){
    return new Promise((resolve, reject) => {
        // Check if the user already has a game started
        gamemodel.findOne({ userid: userid, finished: false}, function (err, gamedata) {
            // No games already exist
            if (!gamedata ) {
                songmodel.find({}, function (err, data) {
                    gamemodeltosave = new gamemodel({ songs:data, userid: userid });
                    gamemodeltosave.save(function (e) {
                        if (e) {
                            console.error(e);
                        } 
                        else {
                            //console.log("New game made for", userid);
                            resolve();
                        }
                    });
                });
            }
            // Existing game found
            else {
                resolve();
            }
        });;
    })
}

// Returns a random element from an array, thank you so much https://stackoverflow.com/a/24137301
Array.prototype.random = function () {
    return this[Math.floor((Math.random()*this.length))];
}

async function getrandomsong(userid){
    return new Promise((resolve, reject) => {
        gamemodel.findOne({ userid: userid, finished: false}, function (err, gamedata) {
            randsong = gamedata.songs.random();
            resolve(randsong);
        });
    });
}

// Returns an obfuscated song in an array similar to the array given
async function obfuscatedsong(song) {
	return new Promise((resolve, reject) => {
    	randsongobf = [];
        song.name.split(" ").forEach(element => {
            if (element.length == 1) {
                filler = "";
            }
            if (element.length == 2){
                filler = "*";
            }
            else {
                filler = "*".repeat(element.length - 1);
            }
            randsongobf.push(element[0] + filler);
            });
            randsongobf = randsongobf.join(" ");
            songdata = {
                "name" : randsongobf,
                "artists": song.artists,
                 "release": song.release
            };
    	    resolve(songdata);
    });
}

// Return the current song or return a random song and save it as current
async function checkifcurrentsongexists(userid) {
	return new Promise((resolve, reject) => {
    	gamemodel.findOne({ userid: userid, finished: false}, function (err, gamedata) {
        	if (gamedata.currentsong === undefined || gamedata.currentsong.length == 0) {
            	// Gets a random song from the unused songs in user's active game
            	getrandomsong(userid)
                .then(async function(randomsong){
                	// Save random unused song as the current song
                	await gamemodel.updateOne({ userid: userid, finished: false}, {currentsong: [randomsong]});
                	resolve(randomsong);
                });
            }
        	else {
            	resolve(gamedata.currentsong[0]);
            }
        });
    });
}

async function preparegame(userid) {
    return new Promise((resolve, reject) => {
        //mongoose.disconnect();
        creategame(userid)
            .then(async function(){
                let result = await checkifcurrentsongexists(userid);
                resolve(result);
            });
    })
        .then(async function(data){
            let result = await obfuscatedsong(data);
            return result;
        })
        .then(function(data){
            return(data);
        });
}

async function endifnosongsleft(userid){
    return new Promise((resolve, reject) => {
        gamemodel.findOne({ userid: userid, finished: false}, function (err, gamedata) {})
            .then(async function(data){
                if (data) {
                    if (data.songs === undefined || data.songs.length == 0){
                        await gamemodel.updateOne({ userid: userid, finished: false}, {finished: true , timefinished: Date.now()})
                            .then(function(){
                                resolve(true);
                            });
                    }
                    else {
                        resolve(false);
                    }
                }
            });
    });
}

async function checkguess(userid, guess) {
    return new Promise((resolve, reject) => {
        gamemodel.findOne({ userid: userid, finished: false}, function (err, gamedata) {})
            .then(async function(data){
                // When song guess is correct
                if (data.currentsong[0].name.toLowerCase() == guess.toLowerCase()) {

                    // Get current song and all songs, remove current song from all songs, add to finished songs, remove from current songs
                    newsongs = [];
                    // From new songs array from all the elements that the current song isn't
                    data.songs.forEach(function(element){
                        if (element.name != data.currentsong[0].name) {
                            newsongs.push(element);
                        }
                    })
                    await gamemodel.updateOne({ userid: userid, finished: false}, {songs: newsongs });

                    finishedsongs = data.finishedsongs;
                    finishedsongs.push(data.currentsong[0]);
                    await gamemodel.updateOne({ userid: userid, finished: false}, {finishedsongs: finishedsongs });
                    await gamemodel.updateOne({ userid: userid, finished: false}, {currentsong: [] });

                    // Gives different amounts of points depending on lives
                    if (data.lives == 2) {
                    	newpoints = parseInt(data.points) + 3;
                        // Add 3 points
                        await gamemodel.updateOne({ userid: userid, finished: false}, {points: newpoints });
                        fin = await endifnosongsleft(userid);
                        if (fin) {
							resolve({"status":"finished","livesleft": data.lives,"points": newpoints});
                        }
						else {
                            await gamemodel.updateOne({ userid: userid, finished: false}, {lives: 2 });
							resolve({"status":"correct","livesleft": 2 ,"points": newpoints});
                    	}
                    }
                    else if(data.lives == 1){
						newpoints = parseInt(data.points) + 1;
                        // Add 1 point
                        await gamemodel.updateOne({ userid: userid, finished: false}, {points: newpoints });
                        fin = await endifnosongsleft(userid);
                        if (fin) {
                        	resolve({"status":"finished","livesleft": data.lives ,"points": newpoints});
                        }
                        else {
                            await gamemodel.updateOne({ userid: userid, finished: false}, {lives: 2 });
                        	resolve({"status":"correct","livesleft": 2 ,"points": newpoints});
                        }
                    }
                }
                // When song name guess is wrong
                else {
                    newlives = parseInt(data.lives) - 1;
                    await gamemodel.updateOne({ userid: userid, finished: false}, {lives: newlives })
                        .then(async function(){
                            if (newlives == 0){
                                await gamemodel.updateOne({ userid: userid, finished: false}, {finished: true , timefinished: Date.now()});
                                resolve({"status":"gameover","livesleft":"none"});
                            }
                            else {
                                resolve({"status":"incorrect","livesleft":newlives});
                            }
                        });
                }
            })
            .catch(function(err){
                resolve({"status":"nogamefound"});
            })
    })     
}

// https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  // Get top five scoring games and return them in descending order
async function scoreboardfive(){
    return new Promise(async function(resolve, reject) {
        allgames = await gamemodel.find({ finished: true});
        resolve(allgames);
    })
        .then(function(data){
                // Sorts the games in descending order of points
                data.sort((a, b) => b.points - a.points);
                // Make an array with the top five games
                topfive = data.slice(0, 5);
                return topfive;
        })
        .then(async function(data) {
            let finaltopfive = [];
            // Make an array with the data that is acutally needed client side for the scoreboard
            await asyncForEach(data, async (game) => {
                username = await usermodel.findById(game.userid, function (err, data) { });
                gamearray = {
                    "points" : game.points,
                    "songs" : game.finishedsongs,
                    "starttime" : game.timecreated,
                    "endtime" : game.timefinished,
                    "username": username.user
                };
                finaltopfive.push(gamearray);
            });
            return {"status":"success","games":finaltopfive};
        });
}

// Returns points and lives of current user's game
async function getgameinfo(userid){
    return new Promise(async (resolve, reject) => {
        result = await gamemodel.findOne({ userid: userid, finished: false}, function (err, gamedata) {});
        resolve({"points":result.points, "lives":result.lives});
    });
}

exports.preparegame = preparegame;
exports.creategame = creategame;
exports.checkguess = checkguess;
exports.scoreboardfive = scoreboardfive;
exports.getgameinfo = getgameinfo;