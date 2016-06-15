(function() {
	var timestamp = document.getElementById("timestamp");
	var post = document.getElementById('vesper_post');
	
	// Generate timestamp for post, formatted like this: M/DD/YYYY HH:MM:SS AM/PM
	var dateObject = new Date();
	
	var date = (dateObject.getMonth() + 1) + "/" + dateObject.getDate() + "/" + dateObject.getFullYear();
	
	var time = dateObject.getHours() + ":" 
			// Account for single/double digits
			+ ((dateObject.getMinutes() < 10) ? "0" + dateObject.getMinutes() : dateObject.getMinutes()) + ":"
			+ ((dateObject.getSeconds() < 10) ? "0" + dateObject.getSeconds() : dateObject.getSeconds());
			
	var meridiem = (dateObject.getHours() < 12) ? "AM" : "PM";
	
	timestamp.innerHTML = date + " " + time + " " + meridiem;
		
	// Use VaaS to update vesper_post element with markov chain content
	var xhr = new XMLHttpRequest();
	xhr.open('GET', "http://cors-for-chromell.herokuapp.com/" + "http://vaas.herokuapp.com/", true);
	
	xhr.onload = () => {
		if (xhr.status === 200) {
			const lineBreak = "<br>";
			var parsedResponse = JSON.parse(xhr.responseText);			
			post.innerHTML = parsedResponse.post 
				+ lineBreak
				+ "---" 
				+ lineBreak
				+ "my size 23.5 cm feet" 
				+ lineBreak
				+ "they are rather pretty";
		}
	};
	
	xhr.send();
	
})();