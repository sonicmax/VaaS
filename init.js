/*
 *	Initial setup
 */

"use strict" // Otherwise we're stuck with ES5

const LOCAL_HOST = 3000;

// Variables required for Markov Chain generation
var input = [];
var firstWords = [];
var currentWord = "";

// Variables required for bot
var currentTopicId;
var currentToken;

// Set up modules
var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
var cheerio = require('cheerio');
var client = require('redis').createClient(process.env.REDIS_URL);

// Set up app
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
	console.log(process.env.USERNAME + "-bot is sentient and ready to shitpost");
});


/**
	*		Redis db handler 
	*/

client.on("connect", () => {
		// Attempt to get "quotes" array from Redis
		client.lrange("quotes", 0, -1, (error, items) => {
			if (error) {
				// TODO: offer ability to use .txt files
			}
			else {
				input = items;
				if (input.length > 0) {
					app.generateMarkovChain();
				}
			}
		});				
});


/**
  * Markov chain methods 
	*/

app.generateMarkovChain = function(shouldReturn) {
	var output = [];
	
	app.createArrays();
	
	// Pick random first word to start with
	currentWord = firstWords[Math.floor((Math.random() * firstWords.length))];	
	
	for (let i = 0, len = app.getPostLength(); i < len; i++) {
		if (currentWord !== "") {
			output.push(currentWord);
		}		
		
		var nextWord = app.generateNextWord();
		
		if (nextWord) {
			currentWord = nextWord;
		}
		else {
			currentWord = "";
		}
	}
	
	app.cachedData.post = output.join(" ").trim();
	
	if (shouldReturn) {				
		return app.cachedData.post;
	}
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


/**
  *		Method which allows us to add new quotes from pastebin raw links
  *		Calls onSuccess with truthy value after quotes have been pushed to Redis
  */
	
app.addNewQuotes = function(url, onSuccess) {
	request.get(url, ((error, response, body) => {
		if (!error && response.statusCode == 200) {
			// Ignore blank lines, 
			var quotes = body.split("\r\n").filter((line) => line && line.indexOf("&lt;") == -1 && line.charAt(0) !== "<");
			
			client.lrange("quotes", 0, -1, (error, items) => {
				if (error) {
					onSuccess(false);
					throw error;
				}
				else {
					// Update local & disk cache
					input = input.concat(quotes);
					client.rpush.apply(client, ["quotes"].concat(quotes).concat(() => { console.log("Quotes stored to redis") }));
					onSuccess(true);
				}
			});	
		
		}
		
	}));
};

/**
  *		Log into ETI using environment vars as credentials & do bot stuff
  *		Calls back onSuccess method after successful POST to async-post.php
  */

app.initBot = function(onSuccess) {
	const LOGIN_URL = "https://endoftheinter.net/";
	const formData = { b: process.env.USERNAME, p: process.env.PASSWORD };
	
	if (!app.isLoggedIn) {
		
		request.post({
			
			headers: {"content-type": "application/x-www-form-urlencoded"},
			url: LOGIN_URL,
			form: formData,
			jar: app.cookieJar
			
		}, (error, response, body) => {
					
				// After successful login, ETI will attempt to redirect you to homepage
				if (!error && response.statusCode === 302) {
						console.log("Logged in successfully.");
						app.isLoggedIn = true;
						app.getTopicList(onSuccess);		
				}
				
				else {
					console.log("Login failed.");
					throw error;
				}
		});
	}
	
	else {
		console.log("Already logged in - skipping");
		app.getTopicList(onSuccess);
	}
};

app.getTopicList = function(onSuccess) {
	var LUE_TOPICS = "https://boards.endoftheinter.net/topics/LUE";
	
	request({
		
		url: LUE_TOPICS,
		jar: app.cookieJar
		
	}, (error, response, body) => {
		
		if (!error && response.statusCode === 200) {
			// Find random topic to pester
			var $ = cheerio.load(body);
			var randomTopic = Math.floor(Math.random() * 50) + 1;
			var href;
			
			// I don't understand the cheerio library. This is ridiculous. I don't care.
			$('td.oh div.fl a').each((index, element) => {
				
				if (index === randomTopic) {
					href = "https:" + $(element).attr('href');
					var topicNumberRegex = href.match(/(topic=)([0-9]+)/);
					
					if (href !== "https:" && topicNumberRegex) {
						console.log("Found topic to pester:", topicNumberRegex[2]);
						currentTopicId = topicNumberRegex[2];
						return false;
					}
					
					else {
						console.log("Couldn't find href. Index:", index);
						console.log("Random topic:", randomTopic);
						// Avoid potential for infinite loop here
						return false;
					}
				}
				
			});
			
			app.getMessageList(onSuccess);
		}
		
		else {
			console.log("Topic list GET failed.");
			throw error;
		}
		
	});
};

app.getMessageList = function(onSuccess) {
	
	request({
		
		url: "https://boards.endoftheinter.net/showmessages.php?topic=" + currentTopicId,
		jar: app.cookieJar
		
	}, (error, response, body) => {
		
		if (!error && response.statusCode === 200) {
			
			var $ = cheerio.load(body);
			// Can't make POST requests without the value of this token, scraped from quickpost area
			currentToken = $('input[name="h"]').attr('value');
			app.contributeToDiscussion(onSuccess);
		}
		
		else {
			console.log("Topic list GET failed.");
			throw error;
		}
		
	});
};

app.contributeToDiscussion = function(onSuccess) {
	const QUICKPOST_URL = "https://boards.endoftheinter.net/async-post.php";
	
	var formData = {
			topic: currentTopicId,
			h: currentToken,
			message: app.generateMarkovChain(true) // Pass true to get return value immediately
	};
			
	request.post({
		
		uri: QUICKPOST_URL,
		form: formData,
		jar: app.cookieJar

	}, (error, response, body) => {
		
			if (!error && response.statusCode === 200) {
				// Callback onSuccess with topic id
				console.log("Post successful @", currentTopicId);
				onSuccess(currentTopicId);
			}
		
			else {
				console.log("Post unsuccessful.");
				throw error;
			}
		
	});
};