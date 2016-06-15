/*
 *	Initial setup
 */

"use strict"
 
const LOCAL_HOST = 3000;
 
var fs = require("fs");
var express = require("express");
var bodyParser = require("body-parser");
var request = require('request');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.cachedData = { "post": "" }; // Basic format for JSON response
 
var routes = require("./routes/routes.js")(app);

var deployTarget = process.env.PORT || LOCAL_HOST;

var server = app.listen(deployTarget, () => {
	console.log("App listening on " + deployTarget);
	app.init();
});

var vespyString = "";
var input = vespyString.split(' ');
var firstWords = [];
var currentWord = "";

app.init = function() {
	var output = [];
	app.createArrays();
	// Pick random first word to start with
	currentWord = () => { firstWords[Math.floor((Math.random() * firstWords.length))] };	
	
	for (let i = 0, len = app.getPostLength(); i < len; i++) {
		output.push(currentWord);		
		currentWord = app.generateNextWord();
	}
	
	app.cachedData.post = output.join(" ");
};

app.getPostLength = function() {
	return 10;
};

app.createArrays = function() {
	// Create array containing first word of each sentence		
	for (let i = 0, len = input.length; i < len; i++) {
		let word = input[i];
		let lastChar = word.charAt(word.length - 1);	
		
		if (i === 0) {
			firstWords.push(word);
		}
		
		else if (i > 0 && lastChar === ".") {
			// next word (i + 1) will start new sentence
			let firstWord = input[i + 1];
			firstWords.push(firstWord);
		}
	}
};

app.generateNextWord = function() {
	let tempArray = [];
	
	// Iterate over input array to find instances of current word
	for (let i = 0, len = input.length - 1; i < len; i++) {
		let wordToCheck = input[i];
		// create array of words that are likely to follow current word
		if (wordToCheck === currentWord) {
			// Make sure that item at index i + 1 exists
			if (i < len - 1) {
				let nextWord = input[i + 1];
				tempArray.push(nextWord);
			}
			else {
				// reached end of array - do nothing
			}
		}
	}
	
	let rnd = Math.floor((Math.random() * tempArray.length));
	
	if (tempArray[rnd]) {							
		return tempArray[rnd];
	}
	
	else {
		return "fhuuump"; // silenced shotgun sound
	}
};