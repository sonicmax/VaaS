(function() {
	var timestamp = document.getElementById("timestamp");
	var post = document.getElementById("vesper_post");
	var refreshButton = document.getElementById("refresh");
	
	// Function which generates timestamp for post, formatted as: M/DD/YYYY HH:MM:SS
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

		
	// Function which handles API interaction
	var updatePost = function() {
		// Use VaaS to update vesper_post element with markov chain content
		var xhr = new XMLHttpRequest();		
		var protocol = window.location.protocol;
		xhr.open('GET', protocol + "//cors-for-chromell.herokuapp.com/" + protocol + "//vaas.herokuapp.com/", true);
		xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
		
		xhr.onload = function() {
			if (this.status === 200) {
				var parsedResponse = JSON.parse(this.responseText);			
				post.innerHTML = parsedResponse.post;
			}
		};
		
		xhr.send();
	};
		
	var updateUi = function() {
		updateTimestamp();
		updatePost();
	};
	
	updateUi();
	
	var timeoutId;
	
	var clickDebouncer = function(evt){
		clearTimeout(timeoutId);
		timeoutId = setTimeout(updateUi, 100);
	};
	
	// Use debouncer here to prevent people from hammering my precious server
	refreshButton.addEventListener('click', clickDebouncer);
		
})();