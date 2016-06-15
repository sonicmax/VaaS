var appRouter = function(app) {
	app.get("/", (req, res) => {
			if (app.cachedData.post !== "") {
				res.send(app.cachedData);
			}
			else {
				return { "post": "fhuuump" }; // silenced shotgun sound
			}
	});
};
 
module.exports = appRouter;