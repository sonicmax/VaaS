var request = require("request");

var bot = function() {
	const LOGIN_URL = "https://endoftheinter.net/";
	const formData = { b: process.env.USERNAME, p: process.env.PASSWORD };

/**
  *  Log into eti using environment vars as credentials & do bot stuff
  *  Calls back after successful POST to async-post.php
  */
	
	var init = function(app, options, callback) {
		
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
							callback(options.topicId);
						}
						
						else {
							// Callback with 0 to indicate that we need to randomly pick topic
							callback(0);
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
				callback(options.topicId);
			}
			
			else {
				// Callback with 0 - app router will choose random topic from topic list
				callback(0);
			}
		}
	};
	
	var contributeToDiscussion = function(app, options, callback) {
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
	
	exports.init = init;
	exports.contributeToDiscussion = contributeToDiscussion;
	
}();