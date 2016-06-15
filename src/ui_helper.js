(function() {		
	var timestamp = document.getElementById("timestamp");
	var post = document.getElementById('vesper_post');
	
	// Generate timestamp for post, formatted like this: M/DD/YYYY HH:MM:SS AM/PM
	var dateObject = new Date();
	var date = (dateObject.getMonth() + 1) + "/" + dateObject.getDate() + "/" + date.getFullYear();
	var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
	var meridiem = (date.getHours() < 12) ? "AM" : "PM";
	
	timestamp.innerHTML = date + " " + time + " " + meridiem;
		
	// Use VaaS to update vesper_post element with markov chain content
	var xhr = new XMLHttpRequest();
	var url = "http://vaas.herokuapp.com/";
	
	xhr.open('GET', url, true);
	
	xhr.onload = (response) => {
		if (this.status == 200) {
			message.innerHTML = response.post;
		}
	};
	
	xhr.send();
	
})();