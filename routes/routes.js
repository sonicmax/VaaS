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
		
		else {
			app.initBot((topicId) => {
				
				console.log("initBot success. posting in topic ", topicId);
				
				res.writeHead(302, {
					Location: (req.socket.encrypted ? 'https://' : 'http://') + 
							"boards.endoftheinter.net/showmessages.php?topic=" + topicId
				});
				
				res.end();
				return;
			});						
		}
	});
	
	app.post("/pastebin", (req, res) => {
		if (req.query.token !== process.env.TOKEN) {
			return;
		}
		
		else {
			app.addNewQuotes(req.query.url);
			return;
		};
	});
	
};
 
module.exports = appRouter;