/*
 *	Initial setup
 */

"use strict"
 
const LOCAL_HOST = 3000;
 
var fs = require("fs");
var express = require("express");
var bodyParser = require("body-parser");
var request = require('request');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.cachedData = { "post": "" }; // Basic format for JSON response
 
var routes = require("./routes/routes.js")(app);

var deployTarget = process.env.PORT || LOCAL_HOST;

var server = app.listen(deployTarget, () => {
	app.generateMarkovChain();
});

// NOTE TO SELF: NEVER DO THIS AGAIN. OMG.
var input = ["how was the smokeout last night dandan", "im a weed n00b i just smoke out of this", "its actually p gut bc its indiscreet in public", 
"it looks like im vaping but little do they know im actually blazing", "100 DABS ||| DoNE QUICK }}}}}", "welcome our newest budbomb", 
"how big are we talking about here", "oh so hes obese or smth", "um, am i missing something here", 
"is the word 'big' being understood under a doifferent context",
"my first assumption when i read that post like an hour ago was that it was typo'd autocorrected 'busy' -> 'big' but i just wanted to talk about dicks",
"oh ok", "confusing usage of pronouns in that last bit", "ccrrhh stop validating his weird mind", 
"how come every time i open neko atsume no cats are there , they just leave me a b unch of fish gifts",
"new dog pokemon.png", "um i refill frisky bits in their bowl eveyr dya", "oh hey one just showed up", "Breezy. brwon and white tabby",
"she put the plastic bag over her head though thats dangerous", "suffocation", 
"hhow do i tell her to take it off her head . i took a picture of her altreayd", 
"im tryign to take it off but it doesnt laet me", "help", 
"ok i went into the 'goodies' panel and put away the bag and then i went back to the yard and shes gone", 
"why did she go for the plastic bag, why not the brown bag", "ih ave fishbux, what shoudl i spend them on",
"ok settle down theere nostradamus", "i just chekced my photo album and i ahve like 5 snapshots of other kats , ider takingi these wtf",
"eviedently snowball marshmallow pickles willie and tubbs all got papparazzi'd", "what is this free album thing",
"im not gonna use a guide, im a tr00 gamer", "cant believe theres no page jump in the shop. they really want u tap[ping a lot a lot",
"how much money did she psend", "minnesotan man spends life savings on japanese cat iphone game", "Eat Fresh", 
"yelp profile for midwestern pizza farm", "price range: $$", 
"assembly line chipotle-style 'artisan' pizza chains are like the new starbucks in los angeles. one on every corner", 
"nah, its like a 5 min wait bc theyre personal small 'zas",
"the appeal is that u get to finetune control the amt of toppings they put on it. like, if want xtra minced garlic i can tell them to add more , etc",
"Pizzaa King - Have it Your Way (tm)", "i wish they were affordable around here",
"its like minimum $6-7 for a personal 'za, so after tax and tip youre looking at ten bucks for not all that much food", "its tasty though i admit",
"yea youre expected to tip if youre paying w/ card to offset the transaction fee", 
"re: asian fusion thing - i think thats the one that chipotle founders started rolling out right",
"i usually tip 25c, 50c if the person making my 'za is extra patient w/ my weird demands",
"can u attach suppressors to semiauto shotguns in ovverwatch", "ah. yea i looked it up just now and its this one https://www.shophousekitchen.com/",
"if im payging a premium im gonna fine tune the shit out of my 'za", "thats my little brother at chipotle lol", 
"he has a multistep pro strat at chipotle that i would never have the nerve to try", "iirc \
burrito bowl \
2 tortillas on the side \
no beans, just 'a little bit of rice \
half barbacoa/half steak \
salsas \
** nicely ask the salsa person for 'just a little more steak' ** \
two cups of the pico de gallo style salsa on the side \
a cup of water", "i would never be able to pull it off", "he lifts", 
"some yeti posted in a 'le topic about how every time he eats there he steals 1 or 2 bottles of tabasco for the road", "a true yeti",
"🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻🙌🏻", // Really vesper?
"oh great now i have to deal with the cat stuck in the box", "shes stuck , shes wagging her tail frantically", "i didnt put that there", 
"lowes \
\
never stop improving", "mad men but set in the 00s and one of their clients is Lowes and don pitches a campaign involving neko atsume",
"i just put green and chip[otle tabasco and lemon juice on it", "its alreayd really salty i couldnt handle the xtra sodium 'lad 'ssing brings",
"why arent the other cats helping her", "a moe girl", 
"like , the fat cat in the middle is just sitting motionless in the middle (hes DEF stuck bc its a much smaller box) and its like, whh yarent u helping the cat stuck in the cakke box 3 ft away form you",
"oh my brother asks for a side of this on the side too lol", "i would burst out laughing if i saw that sign", "WATASHI WEDNESDAY",
"whats the matter, too COOL for u?", "this doesnt work japanese ppl cant make the 'th' sound", 
"i want a kitten. im looking on craigslist for a kitten. lots of sketchy listings", "what about catdogs",
"only 90s kids will remember this. were u born in the 90s i dont think so. ", "how much is my banjo kazooie cart worth",
"what is a wedge \
\
like weddge of cheese ??", "keep it cheesy", "something about the prospect of living 10 minutes away from jngy just gave me the willies",
"LMAO", "her name . \"sayaka miki\" its so perfect, \"sayaka miki\"", "LMAO i cant stop sayign 'sayaka miki' and laughign", 
"compared to all the other madokas sayaka has by faer the best and funniest name", "my mom says im cool..", 
"she does.. im the coolest kid on the block she sayas", "she told me not to listen to bullies bbeacause theyre just jhealous of how cool i am"];

var firstWords = [];
var currentWord = "";

app.generateMarkovChain = function() {
	var output = [];
	app.createArrays();
	// Pick random first word to start with
	currentWord = firstWords[Math.floor((Math.random() * firstWords.length))];	
	
	for (let i = 0, len = app.getPostLength(); i < len; i++) {
		output.push(currentWord);		
		currentWord = app.generateNextWord();
	}
		
	console.log(output);
		
	app.cachedData.post = output.join(" ").trim();
};

// TODO: Improve this method
app.getPostLength = function() {
	return input[Math.floor((Math.random() * input.length))].length;
};

app.createArrays = function() {
	// Create array containing first word of each sentence		
	for (let i = 0, len = input.length; i < len; i++) {		
		let sentence = input[i];
		let firstWord = sentence.split(" ")[0];		
		firstWords.push(firstWord);
	}
};

app.generateNextWord = function() {
	let tempArray = [];
	
	// Iterate over input array to find instances of current word
	for (let i = 0, len = input.length - 1; i < len; i++) {
		let sentenceToCheck = input[i].split(" ");
		
			for (let j = 0, len = sentenceToCheck.length; j < len; j++) {
				var currentWord = sentenceToCheck[j];
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
	}
	
	let rnd = Math.floor((Math.random() * tempArray.length));
	
	if (tempArray[rnd]) {							
		return tempArray[rnd];
	}
	
	else {
		return "fhuuump"; // silenced shotgun sound
	}
};