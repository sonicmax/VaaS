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
		// NOTE: Duplicate "..." strings in ellipsisStates array are intentional		
		const ellipsisStates = [".", "..", "...", "...", "...", "..."];		
		var state = 0;
		
		post.innerHTML = "waiting for server" + ellipsisStates[state];
		
		animationId = setInterval(() => {
			
			post.innerHTML = "waiting for server" + ellipsisStates[state];
			state++;
			
			if (state > 5) {
				// Reset state
				state = 0;
			}
			
		}, 250);
		
	};
	
	/** Function which generates timestamp for post, formatted as: M/DD/YYYY HH:MM:SS */
	var updateTimestamp = function() {
		var dateObject = new Date();
		
		var date = (dateObject.getMonth() + 1) + "/" + dateObject.getDate() + "/" + dateObject.getFullYear();
		
		var time = dateObject.getHours() + ":" 
				// Account for single/double digits
				+ ((dateObject.getMinutes() < 10) ? "0" + dateObject.getMinutes() : dateObject.getMinutes()) + ":"
				+ ((dateObject.getSeconds() < 10) ? "0" + dateObject.getSeconds() : dateObject.getSeconds());
				
		var meridiem = (dateObject.getHours() < 12) ? "AM" : "PM";
		
		timestamp.innerHTML = date + " " + time + " " + meridiem;
	};

		
	/** Function which handles API interaction */
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
				updatePost(parsedResponse.post);
				
			}
		};
		
		xhr.send();
	};
		
	var updatePost = function(content) {
		post.innerHTML = content;
	};
	
	var timeoutId;
	
	var clickDebouncer = function(evt) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(init, 100);
	};
	
	// Use debouncer here to prevent people from hammering my precious server
	refreshButton.addEventListener('click', clickDebouncer);
	
	init();
		
})();