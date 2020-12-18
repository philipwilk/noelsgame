// Load express
var express = require('express');
var router = express.Router();
// Cookie parser
const cookieParser = require("cookie-parser");
// Celebrate/Joi parser, for validation
const { celebrate, Joi, errors, Segments } = require('celebrate');
// Require crypto module 
const crypto = require("crypto");
// Load mongoose package
const mongoose = require('mongoose');
// Load JWT package; what we need to sign and verify tokens
const jwt = require('jsonwebtoken');
const { allowedNodeEnvironmentFlags } = require('process');
const { errorMonitor } = require('stream');

// Loads other dependencies
var usermodel = require('./models.js').usermodel;
var gamecode = require("./game.js");
var logintools = require("./logintools.js");

// Functions


// Routes


// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  next()
})
// define the login check route
router.post('/checklogin', celebrate({
	[Segments.COOKIES]: {
		token: Joi.string().token().required()
	}
	}), cookieParser(), (req, res) => {
        result = logintools.verifytoken(req.cookies.token);
        if (result) {
            res.send({"response": true});
        }
        else {
            res.send({"response": false});
        }
	}
);
// define the authentication route
router.post("/authenticate", celebrate({
    [Segments.BODY]: Joi.object().keys({
        username: Joi.string().required(),
        password: Joi.string().required()
    }),
    }), (req, res) => {
        console.log(req.cookies);
        console.log("Request received for authentication of: " + req.body.username);
        // How do async https://stackoverflow.com/a/28921704/9413954
        logintools.authenticate(req.body.username, req.body.password)
        .then(function(data) {
            console.log("User authentication all clear!");
			if (data.token != undefined) {
				thetoken = data.token;
				//res.setHeader("Set-Cookie", "token="+thetoken+"; HttpOnly; SameSite=Lax; Secure");
				res.cookie("token", thetoken, {httpOnly:true, sameSite:"Lax", expires: new Date(Date.now() + 14 * 86400000)});
			}
            res.send({"status":data.status,"message":data.message});
        })
    }
);
// define route to get username from token id
router.post("/getusername", celebrate({
	[Segments.COOKIES]: {
		token: Joi.string().token().required()
	},
	}), cookieParser(), (req, res) => {
        userid = logintools.verifytoken(req.cookies.token).id;
        if (!userid) {
            res.send({"status":"fail","message":"usernamenotfound"});
        }
        else {
            usermodel.findById(userid, function (err, data) {
                if (!data){
                    res.send({"status":"fail","message":"usernamenotfound"}); 
                }
                else {
                    res.send({"status":"success","username":data.user});
                }
            });
        }
	}
);
// Define route to get user creation date
router.post("/getusercreationdate", celebrate({
	[Segments.COOKIES]: {
		token: Joi.string().token().required()
	}
	}), cookieParser(), (req, res) => {
        userid = logintools.verifytoken(req.cookies.token).id;
        if (!userid) {
            res.send({"status":"fail","message":"usernamenotfound"});
        }
        else {
            usermodel.findById(userid, function (err, data) {
                res.send({"status":"success","date": data.updated_at});
            });
        }
	}
);
// Define route to create an account
router.post("/createaccount", celebrate({
    [Segments.BODY]: Joi.object().keys({
        username: Joi.string().required(),
        password: Joi.string().required()
    }),
    }), (req, res) => {
        // Validation is done by the boilerplate code above, so we can just write the user and password to the database
        console.log("Got account creation request for: " + req.body.username);
        logintools.createanaccount(req.body.username, req.body.password)
        .then(function(data) {
            res.send(data);
        });   
	}
);
// Define route to get a song for the game
router.post("/game", celebrate({
    [Segments.COOKIES]: {
        token: Joi.string().token().required()
    },
    }), cookieParser(), (req, res) => {
        userid = logintools.verifytoken(req.cookies.token).id;
        gamecode.preparegame(userid)
            .then(function(data) {
                res.send(data);
        });
    }
);
// Define route for submitting answer for a song for the game
router.post("/songsubmit", celebrate({
    [Segments.COOKIES]: {
        token: Joi.string().token().required()
    },
    [Segments.BODY]: {
        guess: Joi.string().required()
    },
    }), cookieParser(), (req, res) => {
        userid = logintools.verifytoken(req.cookies.token).id;
        gamecode.checkguess(userid, req.body.guess)
            .then(function(data) {
                res.send(data);
        });
    }
);
// Define route to get top five from scoreboard
router.post("/scoreboard5", celebrate({
    [Segments.COOKIES]: {
        token: Joi.string().token().required()
    },
}), cookieParser(), async function(req, res) {
    await gamecode.scoreboardfive()
        .then(function(data) {
            res.send(data);
        });
    }
);
// Define route to get points and lives of current game
router.post("/getgameinfo", celebrate({
    [Segments.COOKIES]: {
        token: Joi.string().token().required()
    },
}), cookieParser(), async function(req, res) {
    userid = logintools.verifytoken(req.cookies.token).id;
    await gamecode.getgameinfo(userid)
        .then(function(data) {
            res.send(data);
        });
    }
);

module.exports = router;