/*
 *	Initial setup
 */

"use strict" // Otherwise we're stuck with ES5

const LOCAL_HOST = 3000;

// Variables required for Markov Chain generation
var input;
var firstWords = [];
var currentWord = "";

// Set up modules
var express = require("express");
var bodyParser = require("body-parser");
var client = require('redis').createClient(process.env.REDIS_URL);

// Set up app
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.cachedData = { "post": "" }; // Basic format for JSON response

// Set up routing for API
var routes = require("./routes/routes.js")(app);

// Set up server
var server = app.listen(process.env.PORT || LOCAL_HOST, () => {
	console.log("vesperbot is sentient and ready to shitpost");
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
				app.generateMarkovChain();
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
		
		var nextWord = app.generateNextWord();
		
		if (nextWord) {
			currentWord = nextWord;
		}
		else {
			currentWord = "";
		}
	}
		
	app.cachedData.post = output.join(" ").trim();
};

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
	var tempArray = [];
	// Iterate over input array to find instances of current word
	for (let i = 0, len = input.length - 1; i < len; i++) {
		let sentenceToCheck = input[i].split(" ");
		
		for (let j = 0, len = sentenceToCheck.length; j < len; j++) {
			let wordToCheck = sentenceToCheck[j];
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