const mongoose = require('mongoose');

// Define schema for users
var userschema = new mongoose.Schema({
	user: String,
	password: String,
	salt: String,
	admin : { type: Boolean, default: false },
	updated_at: { type: Date, default: Date.now },
});
// Create model from userchema
var usermodel = mongoose.model('user', userschema);

// Define schema for songs
var songschema = new mongoose.Schema({
	name: String,
	release: Number,
	artists: Array,
	genre: String
});
/* Example song
[
{
  "name": "Diggy Diggy Hole",
  "release": 2014,
  "artists": ["The Yogscast"],
  "genre": "Videogames"
}
]
*/

// Create model from songschema
var songmodel = mongoose.model("songs", songschema);

// Define schema for games
var gameschema = new mongoose.Schema({
	songs: Array,
	currentsong: Array,
	finishedsongs: Array,
	userid: String,
	finished: {type: Boolean, default: false},
	points: {type: Number, default: 0},
	lives: {type: Number, default: 2},
	timecreated: { type: Date, default: Date.now},
	timefinished: { type: Date, default: Date.now}
})
// Create model from gameschema
var gamemodel = mongoose.model("games", gameschema);

exports.usermodel = usermodel;
exports.songmodel = songmodel;
exports.gamemodel = gamemodel;