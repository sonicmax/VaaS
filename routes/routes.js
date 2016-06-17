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
		// Obviously not just gonna let any old yahoo in here...
		if (req.query.token != process.env.TOKEN) {
			return;
		}
		
		else {
			app.addNewQuotes(req.query.url);
			return;
		};
	});
	
};
 
module.exports = appRouter;