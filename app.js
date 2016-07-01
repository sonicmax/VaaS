/*
 *  Initial setup
 */

"use strict"

const LOCAL_HOST = 3000;

var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
var client = require("redis");
var markovChain = require("./helpers/markov.js");

// Set up app and add some global vars
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.cookieJar = request.jar(); // Global cookie store
app.cachedData = { "post": "" }; // Basic format for JSON response
app.isLoggedIn = false;
app.currentToken = null;

// Set up routing for API
var routes = require("./routes/routes.js")(app);

// Set up server
var server = app.listen(process.env.PORT || LOCAL_HOST, () => {
	
	// Check that required environment variables exist
	if (!process.env.USERNAME || !process.env.PASSWORD || !process.env.USER_ID || !process.env.REDIS_URL || !process.env.TOKEN) {
		console.log("ERROR: environment variables not configured correctly. see README for more info");
		return;
	}
	
	// Environment vars are always strings, so we need to check that USER_ID can be converted to integer.
	if (typeof parseInt(process.env.USER_ID, 10) !== "number") {
		console.log("ERROR: USER_ID couldn't be parsed to integer, doublecheck your settings");
		return;
	}

	else {
		// Connect to db and retrieve quotes.
		app.db = client.createClient(process.env.REDIS_URL);

		app.db.on("connect", () => {
			
			app.db.lrange("quotes", 0, -1, (error, items) => {
				
				if (error) {	
					console.log(process.env.USERNAME + "-bot init failed to load db. check that redis is configured correctly");
					return;
				}
				
				else if (items.length === 0) {
					console.log(process.env.USERNAME + "-bot init success, but db was empty");
					return;
				}
						
				else {
					// Pregenerate some text for first user
					markovChain.setInput(items);
					markovChain.generate(app, false, null);
					console.log(process.env.USERNAME + "-bot init success");				
				}
				
			});
			
		});
	}
	
});