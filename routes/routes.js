var appRouter = function(app) {
	const DEFAULT_RESPONSE = { "post": "fhuuump" }; // silenced shotgun sound for error handling/secret reasons
	
	app.get("/", (req, res) => {
			if (app.cachedData.post !== "") {
				res.send(app.cachedData);
				app.generateMarkovChain();
			}
			else {
				return DEFAULT_RESPONSE; 
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

		app.initBot(target, false, (topicId) => {
		
			res.writeHead(302, {
				Location: "https://boards.endoftheinter.net/showmessages.php?topic=" + topicId
			});
			
			res.end();
			return;
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
			return;
		});
		
	});
	
	app.get("/pastebin", (req, res) => {
		if (req.query.token !== process.env.TOKEN) {
			return { "quotes added": false };
		}
		
		else {
			app.addNewQuotes(req.query.url, (onSuccess) => {
				return { "quotes added": onSuccess };
			});			
		}
	});
	
};
 
module.exports = appRouter;