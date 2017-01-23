var markovChain = require("../helpers/markov.js");
var bot = require("../helpers/bot.js");
var dbHelper = require("../helpers/db_helper.js");
var eti = require("../helpers/eti.js");

/** method which handles endpoint routing */
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
		
		if (!req.query.topic) {
			return res.send({ "status:": "ERROR: post endpoint requires topic parameter)" });
		}
		
		var topicId = parseInt(response, 10);
		
		if (typeof topicId !== "number") {
			return res.send({ "status:": "ERROR: topic id is not a number" });
		}				
	
		else {
			var options = {};
			
			var firstWord = req.query.word || null;
			
			bot.init(app, (topicId) => {
								
				options.topicId = topicId;				
				options.msg = req.query.msg || markovChain.generate(app, true, options.firstWord);					
							
				postInTopic(app, res, options);
				
			});
		}
		
	});	
	
	/** Attempt to add pastebin contents to database, callback with status of operation */
	app.get("/pastebin", (req, res) => {
		
		if (req.query.token !== process.env.TOKEN) {
			return res.send({ "status:": "access denied" });
		}
		
		else {
			dbHelper.addNewQuotes(req, app, (status) => { res.send( { "status:": status } )});
		}
		
	});
	
	/** subscribe for livelinks updates **/
	app.get("/subscribe", (req, res) => {
		
		if (req.query.token !== process.env.TOKEN || !req.query.topic) {
			return res.send("ERROR: invalid token in env vars, or no topic was provided in query parameter");		
		}
				
		// TODO: after each request times out we need to create a new one. after 5-10 requests we should stop looking
		eti.subscribe({"topic": req.query.topic}, (response) => { res.send(response) });
		
	});
	
	
	/*
	 *  Helper methods
	 */	 
	 
	/** redirects user to given URL */
	var redirectUser = function(res, url) {
		// TODO: validate URL before redirect? It should be fine though
		
		res.writeHead(302, {
				Location: url
		});
						
		return res.end();				
	};
	
	/**  
	  *  scrapes hidden token from message list and makes async post request.
	  *  options is object containing topic id and msg text.
	  */
	var postInTopic = function(app, res, options) {
		
		eti.getMessageList(app, options, (response) => {
			
			bot.contributeToDiscussion(app, options, (response) => {
				var topicId = parseInt(response, 10);
				
				if (typeof topicId !== "number") {					
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