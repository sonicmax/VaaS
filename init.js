/*
 *	Initial setup
 */

"use strict" // Otherwise we're stuck with ES5

const LOCAL_HOST = 3000;

// Variables required for Markov Chain generation
var input = [];
var firstWords = [];
var currentWord = "";

// Set up modules
var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
var cheerio = require('cheerio'); // HTML parser
var UINT64 = require('cuint').UINT64; // Unsigned integers for Javascript
var client = require('redis').createClient(process.env.REDIS_URL); // DB

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
  *	Redis db handler 
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
					app.generateMarkovChain(false, null);
				}
			}
		});				
});


/**
  *	Markov chain methods 
  */

app.generateMarkovChain = function(shouldReturn, firstWord) {
	var output = [];
	
	app.createArrays();
	
	// Pick random first word to start with
	currentWord = firstWord || firstWords[Math.floor((Math.random() * firstWords.length))];	
	
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
  *	Method which allows us to add new quotes from pastebin raw links
  *	Calls callback with status after quotes have been pushed to Redis
  */
	
app.addNewQuotes = function(url, callback) {
	if (url.indexOf("://pastebin.com/raw/" === -1)) {
		callback("ERROR: not raw pastebin link");
	}
	
	request.get(url, ((error, response, body) => {
		if (!error && response.statusCode == 200) {
			// Ignore blank lines, 
			var quotes = body.split("\r\n").filter((line) => line && line.indexOf("&lt;") == -1 && line.charAt(0) !== "<");
			
			client.lrange("quotes", 0, -1, (error, items) => {
				if (error) {
					callback("ERROR: fatal error in redis client");
					throw error;
				}
				else {
					// Update local & disk cache
					input = input.concat(quotes);
					
					client.rpush.apply(client, ["quotes"].concat(quotes).concat(() => {
							callback("OK");
					}));				
				}
			});	
		
		}
		
	}));
};

/**
  *	Log into ETI using environment vars as credentials & do bot stuff
  *	Calls back after successful POST to async-post.php
  */

app.initBot = function(options, callback) {
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
					app.isLoggedIn = true;
					
					if (options.topicId) {
						app.getMessageList(options, callback);
					}
					
					else {						
						app.getTopicList(options, callback);		
					}
				}
				
				else {
					callback("ERROR: login failed");
					app.isLoggedIn = false;
				}
		});
	}
	
	else {
		if (options.topicId) {
			app.getMessageList(options, callback);
		}
		
		else {	
			app.getTopicList(options, callback);		
		}
	}
};

/**
  *	Allows us to find current number of unread PMs and number of posts in topic.
  */

app.subscribeToUpdates = function(options, callback) {
	const ENDPOINT = "https://evt0.endoftheinter.net/subscribe";
	
	var topicPayload = UINT64(0x0200).shiftLeft(UINT64(48)).or(UINT64(options.topicId));
	var pmPayload = UINT64(0x0100).shiftLeft(UINT64(48)).or(UINT64(process.env.USER_ID));
	
	var payload = {};
	payload[pmPayload] = options.pmCount || 0; // Return all messages by default
	payload[topicPayload] = options.postCount || 1; // Returns total post count by default
	
		request.post({
			
			headers: {
					"content-type": "text/plain;charset=UTF-8",
					"Connection": "keep-alive"
			},
			
			timeout: 600000, // 60s
			url: ENDPOINT,
			body: JSON.stringify(payload),
			jar: app.cookieJar
			
		}, (error, response, body) => {
													
				if (!error && response.statusCode === 200) {
					var parsedResponse = JSON.parse(body.replace("}{", "{"));
					callback(parsedResponse);
				}
				
		});
};

app.getTopicList = function(options, callback) {
	var LUE_TOPICS = "https://boards.endoftheinter.net/topics/LUE-CJ-Anonymous-NWS-NLS";
	
	request({
		
		url: LUE_TOPICS,
		jar: app.cookieJar
		
	}, (error, response, body) => {
		
		if (!error && response.statusCode === 200) {
			// Find random topic to pester
			var $ = cheerio.load(body);
			var randomTopic = Math.floor(Math.random() * 50) + 1;
			
			// I don't understand the cheerio library. This is ridiculous. I don't care.
			$('td.oh div.fl a').each((index, element) => {
				
				if (index === randomTopic) {
					var href = "https:" + $(element).attr('href');
					var topicNumberRegex = href.match(/(topic=)([0-9]+)/);
					
					if (href !== "https:" && topicNumberRegex) {
						console.log("Found topic to pester:", topicNumberRegex[2]);
						options.topicId = topicNumberRegex[2];
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
			
			app.getMessageList(options, callback);
		}
		
		else {
			app.isLoggedIn = false; // Just as a precaution
			callback("failed to load topic list");
		}
		
	});
};

app.getMessageList = function(options, callback) {
	
	request({
		
		url: "https://boards.endoftheinter.net/showmessages.php?topic=" + options.topicId,
		jar: app.cookieJar
		
	}, (error, response, body) => {
		
		if (!error && response.statusCode === 200) {
			
			var $ = cheerio.load(body);
			// Can't make POST requests without the value of this token, scraped from quickpost area
			options.currentToken = $('input[name="h"]').attr('value');
			
			app.contributeToDiscussion({

					"topicId": options.topicId,
					// If msg is undefined, generate markov chain output
					"msg": options.msg || app.generateMarkovChain(true, options.firstWord),
					"currentToken": options.currentToken

			}, callback);
		}
		
		else {
			app.isLoggedIn = false; // Just as a precaution
			callback("failed to load message list. topic id: ", options.topicId);
		}
		
	});
};

app.contributeToDiscussion = function(options, callback) {
	const QUICKPOST_URL = "https://boards.endoftheinter.net/async-post.php";
			
	request.post({
		
		uri: QUICKPOST_URL,

		form: {
			topic: options.topicId,
			h: options.currentToken,
			message: options.msg
		},

		jar: app.cookieJar

	}, (error, response, body) => {
		
			if (!error && response.statusCode === 200) {
				// Callback with topic id				
				callback(options.topicId);
			}
		
			else {
				app.isLoggedIn = false; // Just as a precaution
				callback("Error while contributingToDiscussion. Status code:", response.statusCode);				
			}
		
	});
};