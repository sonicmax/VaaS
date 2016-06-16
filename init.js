/*
 *	Initial setup
 */

"use strict"

const LOCAL_HOST = 3000;

// Set up modules
var express = require("express");
var bodyParser = require("body-parser");
var client = require('redis').createClient(process.env.REDIS_URL);
var routes = require("./routes/routes.js")(app);

// Set up app
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.cachedData = { "post": "" }; // Basic format for JSON response

var deployTarget = process.env.PORT || LOCAL_HOST; // Allows for live or local testing

var server = app.listen(deployTarget, () => {	
	app.generateMarkovChain();
});


/* Redis handler */

client.on("connect", () => {
		// Attempt to get "quotes" array from Redis
		client.lrange("quotes", 0, -1, (error, items) => {
			if (error) {
				// TODO: Store emergency vesper.txt somewhere in repo and use that instead
				throw error;
			}		
			else {
				input = items;
			}		
		});				
});


/* app helper methods */

app.generateMarkovChain = function() {
	var output = [];
	app.createArrays();
	// Pick random first word to start with
	currentWord = firstWords[Math.floor((Math.random() * firstWords.length))];	
	
	for (let i = 0, len = app.getPostLength(); i < len; i++) {
		output.push(currentWord);		
		if (app.generateNextWord()) {
			currentWord = app.generateNextWord();
		}
	}
		
	console.log(output);
		
	app.cachedData.post = output.join(" ").trim();
};

// TODO: Improve this method
app.getPostLength = function() {
	return input[Math.floor((Math.random() * input.length))].length;
};

app.createArrays = function() {
	// Create array containing first word of each sentence		
	for (let i = 0, len = input.length; i < len; i++) {		
		let sentence = input[i];
		let firstWord = sentence.split(" ")[0];		
		firstWords.push(firstWord);
	}
};

app.generateNextWord = function() {
	let tempArray = [];
	
	// Iterate over input array to find instances of current word
	for (let i = 0, len = input.length - 1; i < len; i++) {
		let sentenceToCheck = input[i].split(" ");
		
		for (let j = 0, len = sentenceToCheck.length; j < len; j++) {
			var wordToCheck = sentenceToCheck[j];
			// create array of words that are likely to follow current word
			if (wordToCheck === currentWord) {
				// Make sure that item at index i + 1 exists
				if (j < len - 1) {
					let nextWord = sentenceToCheck[j + 1];
					tempArray.push(nextWord);
				}
				else {
					// reached end of array - do nothing
				}
			}
		}
	}
	
	let rnd = Math.floor((Math.random() * tempArray.length));
	
	if (tempArray[rnd]) {					
		return tempArray[rnd];
	}
	
	else {		
		return;
	}
};