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
app.currentTopicId; // Current topic that bot is posting in

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
				// TODO: Store emergency vesper.txt somewhere in repo and use that instead
				throw error;
			}		
			else {
				input = items;
				app.generateMarkovChain();
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
  */
	
app.addNewQuotes = function(url) {
	request.get(url, ((error, response, body) => {
		if (!error && response.statusCode == 200) {
			// Ignore blank lines, 
			var quotes = body.split("\r\n").filter((line) => line && line.indexOf("&lt;") == -1 && line.charAt(0) !== "<");
			
			client.lrange("quotes", 0, -1, (error, items) => {
				if (error) {
					throw error;
				}
				else {
					// Update local & disk cache
					input = input.concat(quotes);
					client.rpush.apply(client, ["quotes"].concat(quotes).concat(() => { console.log("Quotes stored to redis") }));
				}
			});	
		
		}
		
	}));
};

/**
  *		Log into ETI using environment vars as credentials
  */

app.loginToBlueSite = function() {
	const LOGIN_URL = "https://endoftheinter.net/";
	const formData = { b: process.env.USERNAME, p: process.env.PASSWORD };
	
	request.post({
		
		headers: {"content-type": "application/x-www-form-urlencoded"},
		url: LOGIN_URL,
		form: formData,
		jar: app.cookieJar
		
	}, (error, response, body) => {
				
			// After successful login, ETI will attempt to redirect you to homepage
			if (!error && response.statusCode === 302) {
					app.getTopicList();			
			}
			
			else {
				console.log("Login failed.");
				throw error;
			}
	});
};

app.getTopicList = function() {
	var LUE_TOPICS = "https://boards.endoftheinter.net/topics/LUE";
	
	request({
		
		url: LUE_TOPICS,
		jar: app.cookieJar
		
	}
	, (error, response, body) => {
		
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
						app.currentTopicId = topicNumberRegex[2];
						console.log('current topic id:', app.currentTopicId);
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
			
			app.getMessageList(href);
		}
		
		else {
			console.log("Topic list GET failed.");
			throw error;
		}
		
	});
};

app.getMessageList = function(url) {
	
	request({
		
		url: url,
		jar: app.cookieJar
		
	}, (error, response, body) => {
		
		if (!error && response.statusCode === 200) {
			
			var $ = cheerio.load(body);
			// Can't make POST requests without the value of this token, scraped from quickpost area
			currentToken = $('input[name="h"]').attr('value');
			console.log(currentToken);
			app.contributeToDiscussion();
		}
		
		else {
			console.log("Topic list GET failed.");
			throw error;
		}
		
	});
};

app.contributeToDiscussion = function() {
	const QUICKPOST_URL = "https://boards.endoftheinter.net/async-post.php";
	
	var formData = {};
			formData.topic = app.currentTopicId;
			formData.h = currentToken;
			formData.message = app.generateMarkovChain(true); // Pass true to get return value immediately
			
	request.post({
		
		uri: QUICKPOST_URL,
		form: formData,
		jar: app.cookieJar

	}, (error, response, body) => {
		
			if (!error && response.statusCode === 200) {
				// I guess Do nothing
				return app.currentTopicId;
			}
		
			else {
				console.log("Post unsuccessful: code ", response.statusCode);
				throw error;
			}
		
	});
};