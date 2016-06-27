/*
 *	Initial setup
 */

"use strict" // Otherwise we're stuck with ES5

const LOCAL_HOST = 3000;

// Set up modules
var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
var cheerio = require('cheerio'); // HTML parser
var UINT64 = require('cuint').UINT64; // Unsigned integers for Javascript
var client = require('redis').createClient(process.env.REDIS_URL); // DB

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
	console.log(process.env.USERNAME + "-bot is sentient and ready to shitpost");
});


/**
  *	Redis db handler 
  */

client.on("connect", () => {
	// Attempt to get "quotes" array from Redis
	client.lrange("quotes", 0, -1, (error, items) => {
		
		if (error) {
			// TODO: offer ability to use .txt files or other sources
			// TODO: Configurable option
		}
		
		else {
			input = items;
			if (input.length > 0) {
				markovChain.generate(false, null);
			}
		}
		
	});				
});


var markovChain = function() {
	var input = [];
	var firstWords = [];
	var currentWord = "";

	var createArrays = function() {
		// Create array containing first word of each sentence		
		for (let i = 0, len = input.length; i < len; i++) {		
			let sentence = input[i];
			let firstWord = sentence.split(" ")[0];		
			firstWords.push(firstWord);
		}
	};

	var generateNextWord = function() {
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
		
	var generate = function(shouldReturn, firstWord) {
		var output = [];
		
		createArrays();
		
		// Pick random entry from input & find its length
		var postLength = input[Math.floor((Math.random() * input.length))].length;			

		// Use specified or random first word
		currentWord = firstWord || firstWords[Math.floor((Math.random() * firstWords.length))];		
		
		for (let i = 0; i < postLength; i++) {
			if (currentWord !== "") {
				output.push(currentWord);
			}
			
			var nextWord = generateNextWord();
			
			if (nextWord) {
				currentWord = nextWord;
			}
			else {
				currentWord = "";
			}
		}
		
		cachedData.post = output.join(" ").trim();
		
		if (shouldReturn) {		
			return cachedData.post;
		}			
	};	
	
	return {
		"generate": generate
	};
	
}();


var api = function() {
		
	/**
		*	Method which allows us to add new quotes from pastebin raw links
		*	Calls back with status after quotes have been pushed to Redis
		*/
		
	var addNewQuotes = function(url, callback) {
		if (url.indexOf("://pastebin.com/raw/" === -1)) {
			callback("ERROR: not raw pastebin link");
			return;
		}
		
		request.get(url, ((error, response, body) => {
			if (!error && response.statusCode == 200) {
				// TODO: It would probably be useful to add a "split" parameter here
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
								callback("Redis update OK");
						}));				
					}
				});	
			
			}			
		}));
	};

	return {
		"addNewQuotes": addNewQuotes
	};

}();


var bot = function() {
	const LOGIN_URL = "https://endoftheinter.net/";
	const formData = { b: process.env.USERNAME, p: process.env.PASSWORD };

/**
	*	Log into eti using environment vars as credentials & do bot stuff
	*	Calls back after successful POST to async-post.php
	*/
	
	var init = function(options, callback) {
		
		if (!app.isLoggedIn) {
			
			request.post({
				
				headers: {"content-type": "application/x-www-form-urlencoded"},
				url: LOGIN_URL,
				form: formData,
				jar: app.cookieJar
				
			}, (error, response, body) => {
						
					// After successful login, eti will attempt to redirect you to homepage
					if (!error && response.statusCode === 302) {
						app.isLoggedIn = true;
						
						if (options.topicId) {
							eti.getMessageList(options, callback);
						}
						
						else {						
							eti.getTopicList(options, callback);		
						}
					}
					
					else {
						app.isLoggedIn = false;
						callback("ERROR: login failed. check username/password");						
					}
			});
		}
		
		else {
			if (options.topicId) {
				eti.getMessageList(options, callback);
			}
			
			else {	
				eti.getTopicList(options, callback);		
			}
		}
	};
	
	var contributeToDiscussion = function(options, callback) {
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
					callback("Error while contributing to discussion. Status code:", response.statusCode);				
				}
			
		});
	};
	
	return {
		"contributeToDiscussion": contributeToDiscussion,
		"init": init
	};
	
}();


var eti = function() {
	
	/**
		*	Allows us to find current number of unread PMs and number of posts in topic.
		* Polling this means we can keep up with replies, react to keywords, etc
		*/

	var subscribe = function(options, callback) {
		const ENDPOINT = "https://evt0.endoftheinter.net/subscribe";
		
		var payload = generateLivelinksPayload(options);
	
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
		
	var generateLivelinksPayload = function(options) {
		const TOPIC_CHANNEL = 0x0200;
		const PM_CHANNEL = 0x0100;
		const MAGIC_CONSTANT = 48; // It just works
				
		// We have to use UINT64 because these are Really Long numbers. bitwise op for livelinks ids: CHANNEL << 48 | ID
		var topicPayload = UINT64(TOPIC_CHANNEL).shiftLeft(UINT64(MAGIC_CONSTANT)).or(UINT64(options.topicId));
		var pmPayload = UINT64(PM_CHANNEL).shiftLeft(UINT64(MAGIC_CONSTANT)).or(UINT64(process.env.USER_ID));
		
		var payload = {};
		payload[pmPayload] = options.pmCount || 0; // Return all messages by default
		payload[topicPayload] = options.postCount || 1; // Returns total post count by default		
		
		return payload;
	};

	var getTopicList = function(options, callback) {
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
							options.topicId = topicNumberRegex[2];
							return false;
						}
						
						else {
							// We can't really do anything useful here
							return false;
						}
					}
					
				});
				
				if (options.topicId) {				
					eti.getMessageList(options, callback);
				}
				
				else {
					callback("ERROR: your guess is as good as mine");
				}
			}
			
			else {
				app.isLoggedIn = false; // Just as a precaution
				callback("ERROR: failed to load topic list");
			}
			
		});
	};

	var getMessageList = function(options, callback) {
		
		request({
			
			url: "https://boards.endoftheinter.net/showmessages.php?topic=" + options.topicId,
			jar: app.cookieJar
			
		}, (error, response, body) => {
			
			if (!error && response.statusCode === 200) {
				
				var $ = cheerio.load(body);
				// Can't make POST requests without the value of this token, scraped from quickpost area
				options.currentToken = $('input[name="h"]').attr('value');
				
				bot.contributeToDiscussion({

						"topicId": options.topicId,
						"msg": options.msg || markovChain.generate(true, options.firstWord),
						"currentToken": options.currentToken

				}, callback);
			}
			
			else {
				app.isLoggedIn = false;
				callback("ERROR: failed to load message list. topic id: ", options.topicId);
			}
			
		});
	};
	
	return {
		"subscribe": subscribe,
		"getTopicList": getTopicList,
		"getMessageList": getMessageList
	};

}();
