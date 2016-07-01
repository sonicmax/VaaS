var request = require("request");

var dbHelper = function() {
		
	/**
	  *  Method which allows us to add new quotes from pastebin raw links
	  *  Calls back with status after quotes have been pushed to Redis
	  */
		
	var addNewQuotes = function(app, callback) {
		
		var url = request.query.url;
		
		if (!url || url.indexOf("://pastebin.com/raw/" === -1)) {
			callback("ERROR: not raw pastebin link");			
		}
		
		else {	
			request.get(url, ((error, response, body) => {
				
				if (!error && response.statusCode == 200) {
					// TODO: It would probably be useful to add a "split" parameter here
					var quotes = body.split("\r\n").filter((line) => line && line.indexOf("&lt;") == -1 && line.charAt(0) !== "<");
					
					app.db.lrange("quotes", 0, -1, (error, items) => {
						
						if (error) {
							callback("ERROR: fatal error in redis client");
						}
						
						else {
							// Update local & disk cache
							input = input.concat(quotes);
														
							app.db.rpush.apply(app.db, ["quotes"].concat(quotes).concat(() => {
									callback("Successfully added quotes to database");
							}));
						}
						
					});	
				
				}	
			}));
		}
	};

	exports.addNewQuotes = addNewQuotes;

}();