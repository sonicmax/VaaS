var appRouter = function(app) {
	const DEFAULT_RESPONSE = { "post": "fhuuump" }; // silenced shotgun sound for error handling/secret reasons
	
	app.get("/", (req, res) => {
			if (app.cachedData.post !== "") {
				res.send(app.cachedData);
				app.generateMarkovChain();
			}
			else {
				res.send(DEFAULT_RESPONSE);
			}
	});
	
	// Need to include token from Heroku settings as query paramater in POST requests to these routes
	app.get("/testbot", (req, res) => {
		
		if (req.query.token !== process.env.TOKEN) {
			return;
		}		
		
		var target;
		
		if (req.query.topic) {
			target = req.query.topic;
		}

		app.initBot(target, null, (topicId) => {
		
			res.writeHead(302, {
				Location: "https://boards.endoftheinter.net/showmessages.php?topic=" + topicId
			});
			
			res.end();
		});
		
	});
	
	app.get("/reply", (req, res) => {
		
		if (req.query.token !== process.env.TOKEN	|| !req.query.topic || !req.query.msg) {
			return;
		}

		app.initBot(req.query.topic, req.query.msg, (topicId) => {
			
			res.writeHead(302, {
				Location: "https://boards.endoftheinter.net/showmessages.php?topic=" + topicId
			});
			
			res.end();
		});
		
	});
	
	app.get("/pastebin", (req, res) => {
		if (req.query.token !== process.env.TOKEN) {
			res.send({ "quotes added": false });
		}
		
		else {
			app.addNewQuotes(req.query.url, (onSuccess) => {
				res.send({ "quotes added": onSuccess });
			});			
		}
	});
	
	app.get("/subscribe", (req, res) => {
		
		if (req.query.token !== process.env.TOKEN || !req.query.topic) {
			res.send(DEFAULT_RESPONSE);
		}
		
		app.subscribeToUpdates(req.query.topic, null, null, (response) => {
			res.send(response);
		});
		
	});
	
};
 
module.exports = appRouter;