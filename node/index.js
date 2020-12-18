// Load dotenv
const config = require('dotenv').config();

require('events').EventEmitter.defaultMaxListeners = 50;

// Load expressjs package
const express = require('express');
const app = express();
const process = require('process');

// Use cors
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://" + process.env.tld);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Vary", "Origin");
    next();
});

// Load body-parser package
const bodyParser = require('body-parser');
app.use(bodyParser.json());
// Celebrate/Joi parser, for validation
const { celebrate, Joi, errors, Segments } = require('celebrate');
app.use(errors());

// Load mongoose and connect
const mongoose = require("mongoose");
mongoose.connect(process.env.userdatabase, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('error', console.error.bind(console, "\n   - - - MongoDB connection error! - - -\n"));
mongoose.connection.once("open", function () {
	console.log("Mongoose Connected!");
});



// Import routes
var noelsgame = require('./routes/noelsgame/noelsgame');
// Use routes
app.use("/noelsgame", noelsgame);

// Starts app on set port
app.listen(process.env.serverport, () => {
    console.log("Started server on port 3000");
});

// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', function() {   
	mongoose.connection.close(function () {
    	console.log('Mongoose disconnected on app termination');
    process.exit(0);   });
});


