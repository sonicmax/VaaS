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

// Set up routing for API
var routes = require("./routes/routes.js")(app);

// Set up server
var server = app.listen(process.env.PORT || LOCAL_HOST, () => {
	
	// Connect to db and retrieve quotes.
	app.db = client.createClient(process.env.REDIS_URL);

	app.db.on("connect", () => {
		
		app.db.lrange("quotes", 0, -1, (error, items) => {
			
			if (error) {	
				console.log(process.env.USERNAME + "-bot init failed to load db. check that redis is configured correctly");
			}
			
			else if (items.length === 0) {
				console.log(process.env.USERNAME + "-bot init success, but db was empty");
			}
					
			else {
				// Pregenerate some text for first user
				markovChain.setInput(items);
				markovChain.generate(app, false, null);
				console.log(process.env.USERNAME + "-bot init success");
			}
			
		});
		
	});
	
});