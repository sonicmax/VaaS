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
			res.send({ "status: ": "ERROR: invalid query parameters" });
		}		
		
		var target;
		
		if (req.query.topic) {
			target = req.query.topic;
		}

		app.initBot(target, null, (response) => {
		
			if (response === "post failed") {
				res.send({ "status: ": response});
			}
			
			else {		
				res.writeHead(302, {
					Location: "https://boards.endoftheinter.net/showmessages.php?topic=" + response
				});
				
				res.end();
			}
			
		});
		
	});
	
	app.get("/reply", (req, res) => {
		
		if (req.query.token !== process.env.TOKEN	|| !req.query.topic || !req.query.msg) {
			res.send({ "status: ": "ERROR: invalid query parameters" });
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
			res.send({ "status: ": "ERROR: invalid query parameters" });
		}
		
		else {
			app.addNewQuotes(req.query.url, (status) => {
				res.send({ "status: ": status });
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