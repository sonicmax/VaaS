/**
  *  Contains private methods for generating markov chain, and returns getters/setters
  */
	
"use strict"	
	
var markovChain = function() {

	var input = [];
	var firstWords = [];
	var currentWord = "";

	var createArrays = function() {
		// Create array containing first word of each sentence		
		for (let i = 0, len = input.length; i < len; i++) {		
			let sentence = input[i];
			let firstWord = sentence.split(" ")[0];		
			firstWords.push(firstWord);
		}
	};

	var getNextWord = function() {
		var tempArray = [];
		// Iterate over input array to find instances of current word
		for (let i = 0, len = input.length - 1; i < len; i++) {
			let sentenceToCheck = input[i].split(" ");
			
			for (let j = 0, len = sentenceToCheck.length; j < len; j++) {
				let wordToCheck = sentenceToCheck[j];
				// create array of words that are likely to follow current word
				if (wordToCheck === currentWord) {
					// Make sure that item at index i + 1 exists
					if (j < len - 1) {
						let nextWord = sentenceToCheck[j + 1];
						tempArray.push(nextWord);
					}
					else {
						// reached end of array - do nothing
					}
				}
			}
		}
		
		let rnd = Math.floor((Math.random() * tempArray.length));
		
		if (tempArray[rnd]) {					
			return tempArray[rnd];
		}
		
		else {		
			return;
		}
	};
		
	var generate = function(app, shouldReturn, firstWord) {
		var output = [];
		
		createArrays();
		
		// Pick random entry from input & find its length
		var postLength = input[Math.floor((Math.random() * input.length))].length;

		// Use specified or random first word
		currentWord = firstWord || firstWords[Math.floor((Math.random() * firstWords.length))];		
		
		for (let i = 0; i < postLength; i++) {
			if (currentWord !== "") {
				output.push(currentWord);
			}
			
			var nextWord = getNextWord();
			
			if (nextWord) {
				currentWord = nextWord;
			}
			else {
				currentWord = "";
			}
		}
		
		app.cachedData.post = output.join(" ").trim();
		
		if (shouldReturn) {		
			return app.cachedData.post;
		}			
	};

	var setInput = function(dbArray) {
		input = dbArray;
	}
	
	exports.setInput = setInput;
	exports.generate = generate;

}();