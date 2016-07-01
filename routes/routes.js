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
		
		if (req.query.topic) {			
			var topicId = parseInt(req.query.topic, 10);			
		
			if (typeof topicId !== "number") {
				return res.send({ "status:": "ERROR: topic parameter must be number" });				
			}
			
			options.topicId = topicId;
		}
		
		options.msg = markovChain.generate(app, true, req.query.word);		
		
		bot.init(app, options, (response) => {
			
			if (!options.topicId) {
				// Use topic returned from bot.init method
				var topicId = parseInt(response, 10);			
			
				if (typeof topicId !== "number") {
					// Respond with error message
					return res.send({ "status:": response });				
				}
				
				else if (topicId === 0) {
					
					options.topicId = req.query.topic || topicId;
					
					eti.getTopicList(app, options, (response) => {
					
						return postInTopic(app, res, options);
						
					});						
				}
			}
			
			else {				
				postInTopic(app, res, options);
			}
			
		});
	});
	
	/** posts markov chain text in specified topic **/
	app.get("/reply", (req, res) => {
		
		if (!req.query.topic || !req.query.msg) {
			return res.send({ "status:": "ERROR: missing query parameters (needs topic & msg)" });
		}
		
		var topicId = parseInt(response, 10);
		
		if (typeof topicId !== "number") {
			return res.send({ "status:": "ERROR: topic id is not a number" });
		}
	
		else {
			var options = {};			
			
			bot.init(app, (topicId) => {
								
				options.topicId = topicId;
				options.msg = markovChain.generate(app, true, options.firstWord);					
							
				postInTopic(app, res, options);
				
			});
		}
		
	});	
	
	/** parse pastebin contents and add to database **/
	app.get("/pastebin", (req, res) => {
		
		if (req.query.token !== process.env.TOKEN) {
			return res.send({ "status:": "access denied" });
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
			return res.send("ERROR: invalid token in env vars, or no topic was provided in query parameter");		
		}
				
		eti.subscribe({"topic": req.query.topic}, (response) => { res.send(response) });
		
	});
	
	
	// Helper methods
	var redirectUser = function(res, url) {
		
		res.writeHead(302, {
				Location: url
		});
						
		return res.end();				
	};
	
	var postInTopic = function(app, res, options) {
		
		eti.getMessageList(app, options, (response) => {
			
			bot.contributeToDiscussion(app, options, (response) => {
				var topicId = parseInt(response, 10);
				
				if (typeof topicId !== "number") {
					// This is probably redundant
					return res.send({ "status:": response });
				}
				
				else {
					redirectUser(res, "https://boards.endoftheinter.net/showmessages.php?topic=" + topicId);										
				}
				
			});								
		});
	};
};
 
module.exports = appRouter;