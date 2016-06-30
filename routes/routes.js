var markovChain = require("../helpers/markov.js");
var bot = require("../helpers/bot.js");
var dbHelper = require("../helpers/db_helper.js");
var eti = require("../helpers/eti.js");

var appRouter = function(app) {
	const DEFAULT_RESPONSE = { "post": "fhuuump" };
	
	/** returns JSON response containing markov chain generated text **/
	app.get("/", (req, res) => {
		
		if (app.cachedData.post !== "") {
			res.send(app.cachedData);
			markovChain.generate(app);
		}
		
		else {		
			res.send(DEFAULT_RESPONSE);
		}
			
	});
	
	/** posts markov chain text in random|specified topic **/
	app.get("/testbot", (req, res) => {
		var options = {};
		
		bot.init(app, req, options, (response) => {
			var topicId = parseInt(response, 10);
			
			if (topicId.isNaN()) {
				// Error - do nothing
				res.send({ "status:": response });
			}
			
			else if (topicId === 0) {
				
				options.topicId = topicId;
				options.msg = markovChain.generate(app, true, options.firstWord); 
				options.currentToken = response.currentToken;						
				
				eti.getRandomTopic(options, (response) => { postInTopic(options) });								
			}
			
			else {
				postInTopic(res, options);
			}
			
		});
	});
	
	/** posts markov chain text in specified topic **/
	app.get("/reply", (req, res) => {
		
		if (!req.query.topic || !req.query.msg) {
			res.send({ "status:": "ERROR: missing query parameters (needs topic & msg)" });
			return;
		}
		
		var topicId = parseInt(response, 10);
		
		if (topicId.isNaN()) {
			res.send({ "status:": "ERROR: topic id is not a number" });
		}
	
		else {
			var options = {};			
			
			bot.init(app, req, (topicId) => {
								
				options.topicId = topicId;
				options.msg = markovChain.generate(app, true, options.firstWord); 
				options.currentToken = response.currentToken;						
							
				postInTopic(res, options);
				
			});
		}
		
	});	
	
	/** parse pastebin contents and add to database **/
	app.get("/pastebin", (req, res) => {
		
		if (req.query.token !== process.env.TOKEN) {
			res.send({ "status:": "access denied" });
		}
		
		else {
			// Attempt to add quotes from pastebin link, callback with status of operation
			dbHelper.addNewQuotes(req, app, (status) => { res.send( { "status:": status } )});
		}
		
	});
	
	/** subscribe for livelinks updates **/
	// TODO: after each request times out we need to create a new one. after 5-10 requests we should stop looking
	app.get("/subscribe", (req, res) => {
		
		if (req.query.token !== process.env.TOKEN || !req.query.topic) {		
			res.send(DEFAULT_RESPONSE);
		}
				
		eti.subscribe({"topic": req.query.topic}, (response) => { res.send(response) });
		
	});
	
	
	// Helper methods
	var redirectUser = function(res, url) {
		
		res.writeHead(302, {
				Location: url
		});
						
		res.end();				
	};
	
	var postInTopic = function(res, options) {
		
		eti.getMessageList(options, (response) => {
			
			bot.contributeToDiscussion(options, (topicId) => {
				
				if (parseInt(response, 10).isNaN()) {
					// Probably an error message
					res.send({ "status:": response });
				}
				
				else {
					redirectUser(res, "https://boards.endoftheinter.net/showmessages.php?topic=" + response);										
				}
				
			});								
		});
	};
};
 
module.exports = appRouter;