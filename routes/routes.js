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
			return;
		}
		
		else {
			app.loginToBlueSite();
			return;
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