var appRouter = function(app) {
	app.get("/", (req, res) => {
			if (app.cachedData.post !== "") {
				res.send(app.cachedData);
				app.generateMarkovChain();
			}
			else {
				return { "post": "fhuuump" }; // silenced shotgun sound for error handling
			}
	});
	
	app.post("/pastebin", (req, res) => {
		if (req.query.token != process.env.TOKEN) {
			return;
		}
		
		else {
			app.addNewQuotes(req.query.url);
		};
	});
	
};
 
module.exports = appRouter;