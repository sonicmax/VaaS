var appRouter = function(app, markovChain, bot, api, eti) {
	const DEFAULT_RESPONSE = { "post": "fhuuump" }; // silenced shotgun sound for error handling/secret reasons

	app.get("/", (req, res) => {
		
			if (app.cachedData.post !== "") {
				// TODO: We might have to implement some kind of queue here?
				res.send(app.cachedData);
				markovChain.generate();
			}
			
			else {
				res.send(DEFAULT_RESPONSE);
			}
			
	});
	
	
	app.get("/testbot", (req, res) => {

		bot.init({

				"topicId": req.query.topic,
				"firstWord": req.query.word

		}, (response) => {
		
			if (response === "post failed") {
				res.send({ "status:": response });
			}
			
			else {
				// Redirect user to topic which was just posted in.
				// TODO: figure out exactly which message and give a contextual link? seems hard
				res.writeHead(302, {
						Location: "https://boards.endoftheinter.net/showmessages.php?topic=" + response
				});
				
				res.end();
			}
			
		});		
	});
	
	
	app.get("/reply", (req, res) => {
		
		if (!req.query.topic || !req.query.msg) {
			res.send({ "status:": "ERROR: invalid query parameters" });
		}

		bot.init({
				
				"topicId": req.query.topic,
				"msg": req.query.msg
	
		}, (topicId) => {
			
			res.writeHead(302, {
				Location: "https://boards.endoftheinter.net/showmessages.php?topic=" + topicId
			});
			
			res.end();			
		});
		
	});
	
	
	app.get("/pastebin", (req, res) => {
		
		if (req.query.token !== process.env.TOKEN) {
			res.send({ "status:": "access denied" });
		}
		
		else {
			// Attempt to add quotes from pastebin link, callback with status of operation
			api.addNewQuotes(req.query.url, (status) => { res.send( { "status:": status } )});
		}
		
	});
	
	
	app.get("/subscribe", (req, res) => {
		
		if (req.query.token !== process.env.TOKEN || !req.query.topic) {			
			res.send(DEFAULT_RESPONSE);
		}
				
		eti.subscribe({"topic": req.query.topic}, (response) => { res.send(response) });
		
	});
};
 
module.exports = appRouter;