// Contains functions for actions related to users

// Require crypto module 
const crypto = require("crypto");
// Load mongoose package
const mongoose = require('mongoose');
// Load JWT package; what we need to sign and verify tokens
const jwt = require('jsonwebtoken');

// Loads other dependencies
var usermodel = require('./models.js').usermodel;

async function authenticate(username, password) {
    return new Promise((resolved, reject) => {
        // Declares any necessary variables
        // Userdata will hold any user data during the function call, then be deleted
        var userdata;

        // Connects to DB, currently has to include some extra arguments to avoid deprecated features
        //mongoose.connect(process.env.userdatabase, { useNewUrlParser: true, useUnifiedTopology: true });
        //mongoose.connection.on('error', console.error.bind(console, "\n   - - - MongoDB connection error! - - -\n"));
        //mongoose.connection.once("open", function () {
        //    console.log("\n   - - - MongoDB connection success! - - -\n");
        //});

        // By here, mongoose is ready to interact with the collection in the DB we want to

        // Find the username in the DB and assigns, returns null if not found
        usermodel.findOne({ user: [username] }, function (err, data) {
            if (err) return console.error(err);
            // Saves the found array in the variable "userdata", so data can be accessed directly through dot-notation
            userdata = data;
            if (userdata == null) {
                // Disconnects from DB
                //mongoose.disconnect();
                console.log("   - - - MongoDB disconnected! - - -");
                console.error("   - - - Requested user \"" + username + "\" not found! - - -");
                // This is the output if a user with the submitted username isn't found
                reject(false);
            }
            else {
                console.log("   - - - Username found - - -\n   ", userdata.user, "\n   - - - Date last updated - - -\n   ", userdata.updated_at);
                return new Promise(function(resolve, reject) {
                    resolve(saltandhashonlyhash(userdata.salt, password));
                }).then(function(data) {
                    // Finds the user password and checks it against the given password
                    if (userdata.password == data) {
                        // Disconnects from DB
                        //mongoose.disconnect();
                        console.log("   - - - MongoDB disconnected! - - -");
                        // This is the output when password verification is successful
                        console.log("   - - - Password verification success! - - -");
                        // Returns the user id
                        resolved(userdata._id);
                    }
                    else {
                        // Disconnects from DB
                        //mongoose.disconnect();
                        console.log("   - - - MongoDB disconnected! - - -");
                        console.error("   - - - Password verification failed! - - -");
                        // This is the output if the password verification fails
                        reject(false);
                    }
                });
            }
        });
    })
    .then(function(result) {
        console.log("   - - - Authentication successful, user:" , username);    
        const token = jwt.sign({ id: result, datetime: Date.now()}, process.env.JWT_SECRET , { expiresIn: '2 weeks' });
        // Return success and generated token
        tosend = { "status" : "success", "token": token };
        return(tosend);
    })
    .catch(function(err) {
        console.log(`   - - - There was an error from the authentication promise: ${err}`);
        if (err == false) {
            console.log("   - - - User validation failed: incorrect credentials");
        	tosend = {"status":"failed","message": "invalusrorpwd"};
        }
    	else {
        	tosend = {"status":"failed","error": err}
        }
        return tosend;
    });
};

// Verify JWT
function verifytoken(token) {
    if (!token) return false;
    return jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
        if (err) return err;
        if (!decoded) return false;
        else return decoded;
    });
}

// Hashes input with the arguments provided, in a more manageable async function
async function promisepbkdf2(rawinput, salt, iterations, keylen, hashalgorithm) {
    return new Promise((resolved, reject) => {
        crypto.pbkdf2(rawinput, salt, iterations, keylen, hashalgorithm, (err, derivedkey) => {
            if (err) {console.error(err); reject(err); }
            resolved(derivedkey.toString('hex'));
        })
    });
}

// Function that generates a salt and uses a salted hash to hash an argument, and returns the hashed argument and the salt
async function saltandhash(rawinput) {
    // Lenght of the salt
    var length = 128;
    // Generates a random salt with this length
    var salt = crypto.randomBytes(length).toString("base64");
    // Arguments for hashing
    var hashalgorithm = "sha512";
    var iterations = 100000;
    var keylen = 64;
    return new Promise(function(resolved, reject) {
        resolved(promisepbkdf2(rawinput, salt, iterations, keylen, hashalgorithm));
    }).then(function(data) {
        var result = {salt : salt, hash : data};
        // Returns json with the salt and hash  
        // hasheddata.salt {string} salt
        // hasheddata.hash {string} hashed password
        return result;
    });
};

// Function that uses a salt we already have to hash an argument, returning just the argument
async function saltandhashonlyhash(salt, rawinput) {
    // Arguments for hashing
    var hashalgorithm = "sha512";
    var iterations = 100000;
    var keylen = 64;
    // Hash the argument
    return new Promise(function(resolved, reject) {
        resolved(promisepbkdf2(rawinput, salt, iterations, keylen, hashalgorithm));
    }).then(function(data) {
        var result = data;
        // result {string} the hashed argument
        return result;
    })
};

async function createaccount(username, password) {
    var tosend, usertoadd;
    return new Promise((resolved, reject) => {
            // Connect to MongoDB database 
            //mongoose.connect(process.env.userdatabase, { useNewUrlParser: true, useUnifiedTopology: true });
            //mongoose.connection.on('error', console.error.bind(console, "\n   - - - MongoDB connection error! - - -\n"));
            //mongoose.connection.once("open", function () {
                //console.log("\n   - - - MongoDB connection success! - - -\n");
                // Check if user exists, if they do, reject account creation
				usermodel.findOne({ user: [username] }, function (err, data) {
					// If there is no data, that means that this username (aka, user) does not exist
					if (data == null){
						resolved();
					}
					// If any data is returned, it means that the user exists, so we will not create another, as this would conflict
					else {
						reject("userexists");
					}
				});
				
            //});
            // MongoDB database is connected and ready to be used
    })
    .then(async function() {
        return new Promise((resolved, reject) => {
            let data = saltandhash(password);
            resolved(data);
        })
        .then(function(thesaltandhash) {
            // The salt (to store)
            var salt = thesaltandhash.salt;
            // The hashed password (to store)
            var hashedpassword = thesaltandhash.hash;
            //console.log("password hash is: " + hashedpassword);
            // Generate a document for the user
            usertoadd = new usermodel({ user : username, password : hashedpassword, salt : salt});
            return usertoadd;
        }).then(function(usertoadd) {
            usertoadd.save(function (err) {
                if (err) {
                    tosend = {"status" : "failed", "error" : err};
                    console.error(err);
                    //mongoose.disconnect();
                    return tosend;
                } 
            });
        }).then(function(){
            console.log("Saved user " + username);
            tosend = {"status" : "success", "username" : username};
            return tosend;
        });
    });
    
};

// Wrapper function for the createaccount function
async function createanaccount(username, password) {
    try {
        let result = await createaccount(username, password);
        // Returns data
        return result;
    }
    catch (err) {
		if (err == "userexists"){
			console.log("   - - - User tried to use a username that is in use");
			tosend = {"status":"failed","error": err};
			return tosend;
		}
		else {
			console.log(`   - - - There was an error from the createaccount promise: ${e}`);
			tosend = {"status":"failed","error": err};
			return tosend;
		}
    }
}

exports.createanaccount = createanaccount;
exports.verifytoken = verifytoken;
exports.authenticate = authenticate;