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
};
 
module.exports = appRouter;