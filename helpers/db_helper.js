var request = require("request");

var dbHelper = function() {
		
	/**
	  *  Method which allows us to add new quotes from pastebin raw links
	  *  Calls back with status after quotes have been pushed to Redis
	  */
		
	var addNewQuotes = function(req, app, callback) {
		
		var code = req.query.code;
		
		if (!code) {
			callback("ERROR: missing Pastebin code");			
		}
		
		else {	
			var url = "http://pastebin.com/raw/" + code;
			
			request.get(url, ((error, response, body) => {
				
				if (!error && response.statusCode == 200) {
					var quotes = body.split("\r\n").filter((line) => line && line.indexOf("&lt;") == -1 && line.charAt(0) !== "<");
					
					app.db.lrange("quotes", 0, -1, (error, items) => {
						
						if (error) {
							callback("ERROR: fatal error in redis client");
						}
						
						else {
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