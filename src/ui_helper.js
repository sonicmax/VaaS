(function() {
	var timestamp = document.getElementById("timestamp");
	var post = document.getElementById("vesper_post");
	var refreshButton = document.getElementById("refresh");
	
	/** init method creates loading animation, fetches data from api,and updates timestamp. */	    
	var init = function() {
		animateEllipsis();
		fetchData();	
	};
	
	var animationId;
	
	var animateEllipsis = function() {
		// NOTE: Duplicate "..." strings in FRAMES array are intentional
		const FRAMES = [".", "..", "...", "...", "...", "..."];		
		const OPEN_TAG = "<span class='loading-text'>";
		const CLOSE_TAG = "</span>";
		
		var state = 0;
		
		updatePostHtml(OPEN_TAG + "waiting for server" + FRAMES[state] + CLOSE_TAG);	
		
		animationId = setInterval(() => {
			
			updatePostHtml(OPEN_TAG + "waiting for server" + FRAMES[state] + CLOSE_TAG);
			
			state++;
			
			if (state > 5) {
				// Reset state
				state = 0;
			}
			
		}, 250);
		
	};
	
	/** generates timestamp for post, formatted as: M/DD/YYYY HH:MM:SS */
	var updateTimestamp = function() {
		var dateObject = new Date();
		
		var date = (dateObject.getMonth() + 1) + "/" + dateObject.getDate() + "/" + dateObject.getFullYear();
		
		var time = dateObject.getHours() + ":" 
				// Account for single/double digits
				+ ((dateObject.getMinutes() < 10) ? "0" + dateObject.getMinutes() : dateObject.getMinutes()) + ":"
				+ ((dateObject.getSeconds() < 10) ? "0" + dateObject.getSeconds() : dateObject.getSeconds());
				
		var meridiem = (dateObject.getHours() < 12) ? "AM" : "PM";
		
		timestamp.innerText = date + " " + time + " " + meridiem;
	};

		
	/** fetches data from api */
	var fetchData = function() {
		// Use VaaS to update vesper_post element with markov chain content
		var xhr = new XMLHttpRequest();		
		var protocol = window.location.protocol;
		xhr.open('GET', protocol + "//cors-for-chromell.herokuapp.com/" + protocol + "//vaas.herokuapp.com/", true);
		xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
		
		xhr.onload = function() {
			
			if (this.status === 200) {
				
				clearInterval(animationId);				
				
				var parsedResponse = JSON.parse(this.responseText);
				updatePostText(parsedResponse.post);
				updateTimestamp();
				
			}
		};
		
		xhr.send();
	};
		
	/** Only use if certain that content can be safely injected as html */
	var updatePostHtml = function(content) {
		post.innerHtml = content;
	}
		
	/** Safe method for displaying content in post element */
	var updatePostText = function(content) {
		post.innerText = content;
	};
	
	var timeoutId;
	
	/** rate limit the refresh button to 1 press per 100ms */
	var clickDebouncer = function(evt) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(init, 100);
	};
	
	refreshButton.addEventListener('click', clickDebouncer);
	
	init();
		
})();