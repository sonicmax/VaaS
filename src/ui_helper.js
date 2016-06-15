(function() {
	var timestamp = document.getElementById("timestamp");
	var post = document.getElementById('vesper_post');
	
	// Generate timestamp for post, formatted like this: M/DD/YYYY HH:MM:SS AM/PM
	var dateObject = new Date();
	var date = (dateObject.getMonth() + 1) + "/" + dateObject.getDate() + "/" + dateObject.getFullYear();
	var time = dateObject.getHours() + ":" + dateObject.getMinutes() + ":" + dateObject.getSeconds();
	var meridiem = (dateObject.getHours() < 12) ? "AM" : "PM";
	
	timestamp.innerHTML = date + " " + time + " " + meridiem;
		
	// Use VaaS to update vesper_post element with markov chain content
	var xhr = new XMLHttpRequest();
	xhr.open('GET', "http://vaas.herokuapp.com/", true);
	
	xhr.onload = () => {
		if (xhr.status === 200) {
			var parsedResponse = JSON.parse(xhr.responseText);			
			post.innerHTML = parsedResponse.post;
		}
	};
	
	xhr.send();
	
})();