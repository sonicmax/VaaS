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
		
		var target = false;
		
		if (req.query.topic) {
			target = req.query.topic;
		}
	
		// Chooses random topic if none is specified
		app.initBot(target, (topicId) => {	
			console.log("initBot success. posting in topic ", topicId);
			
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
	
	/*app.get("get/list", (req, res) => {
		if (req.query.token === process.env.TOKEN_2) {
			return { posts: app.getPostsAsArray() };
		}
	});*/
};
 
module.exports = appRouter;