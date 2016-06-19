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
	app.post("/testbot", (req, res) => {
		if (req.query.token !== process.env.TOKEN) {
			return DEFAULT_RESPONSE;
		}
		
		else {
			app.loginToBlueSite();
			return DEFAULT_RESPONSE;
		}
	});
	
	app.post("/pastebin", (req, res) => {
		if (req.query.token !== process.env.TOKEN) {
			return DEFAULT_RESPONSE;
		}
		
		else {
			app.addNewQuotes(req.query.url);
			return DEFAULT_RESPONSE;
		};
	});
	
};
 
module.exports = appRouter;