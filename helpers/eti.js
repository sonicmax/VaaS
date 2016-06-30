var cheerio = require("cheerio"); // HTML parser
var UINT64 = require("cuint").UINT64; // Unsigned ints

var eti = function() {

  /**
    *  Allows us to find current number of unread PMs and number of posts in topic.
    *  Polling this & scraping moremessages.php means we can keep up with replies, react to keywords, etc
    */

	var subscribe = function(app, request, options, callback) {
		const ENDPOINT = "https://evt0.endoftheinter.net/subscribe";
		const SIXTY_SECONDS = 600000;
		
		var payload = generateLivelinksPayload(options);
	
		request.post({
			
			headers: {
					"content-type": "text/plain;charset=UTF-8",
					"Connection": "keep-alive"
			},
			
			timeout: SIXTY_SECONDS,
			url: ENDPOINT,
			body: JSON.stringify(payload),
			jar: app.cookieJar
			
		}, (error, response, body) => {
													
				if (!error && response.statusCode === 200) {
					var parsedResponse = JSON.parse(body.replace("}{", "{"));
					callback(parsedResponse);
				}
				
		});
	};
		
	var generateLivelinksPayload = function(app, request, options) {
		const TOPIC_CHANNEL = 0x0200;
		const PM_CHANNEL = 0x0100;
		const MAGIC_CONSTANT = 48; // It just works
		
		// We have to use UINT64 because these are Really Long numbers. bitwise op for livelinks ids: CHANNEL << 48 | ID
		var topicPayload = UINT64(TOPIC_CHANNEL).shiftLeft(UINT64(MAGIC_CONSTANT)).or(UINT64(options.topicId));
		var pmPayload = UINT64(PM_CHANNEL).shiftLeft(UINT64(MAGIC_CONSTANT)).or(UINT64(process.env.USER_ID));
		
		var payload = {};
		payload[pmPayload] = options.pmCount || 0; // Return all messages by default
		payload[topicPayload] = options.postCount || 1; // Returns total post count by default		
		
		return payload;
	};

	var getTopicList = function(app, request, options, callback) {
		var LUE_TOPICS = "https://boards.endoftheinter.net/topics/LUE-CJ-Anonymous-NWS-NLS";
		
		request({
			
			url: LUE_TOPICS,
			jar: app.cookieJar
			
		}, (error, response, body) => {
			
			if (!error && response.statusCode === 200) {
				// Find random topic to pester
				var $ = cheerio.load(body);
				var randomTopic = Math.floor(Math.random() * 50) + 1;
				
				// I don't understand the cheerio library. This is ridiculous. I don't care.
				$('td.oh div.fl a').each((index, element) => {
					
					if (index === randomTopic) {
						var href = "https:" + $(element).attr('href');
						var topicNumberRegex = href.match(/(topic=)([0-9]+)/);
						
						if (href !== "https:" && topicNumberRegex) {
							options.topicId = topicNumberRegex[2];
							return false;
						}
						
						else {
							// We can't really do anything useful here
							return false;
						}
					}
					
				});
				
				if (options.topicId) {				
					eti.getMessageList(options, callback);
				}
				
				else {
					callback("ERROR: your guess is as good as mine");
				}
			}
			
			else {
				app.isLoggedIn = false; // Just as a precaution
				callback("ERROR: failed to load topic list");
			}
			
		});
	};

	var getMessageList = function(app, request, options, callback) {
		
		request({
			
			url: "https://boards.endoftheinter.net/showmessages.php?topic=" + options.topicId,
			jar: app.cookieJar
			
		}, (error, response, body) => {
			
			if (!error && response.statusCode === 200) {
				
				var $ = cheerio.load(body);
				// Can't make POST requests without the value of this token, scraped from quickpost area
				options.currentToken = $('input[name="h"]').attr('value');			
				callback(options);
			}
			
			else {
				app.isLoggedIn = false;
				callback("ERROR: failed to load message list. topic id: ", options.topicId);
			}
			
		});
	};
	
	exports.subscribe = subscribe;
	exports.getTopicList = getTopicList;
	exports.getMessageList = getMessageList;	

}();