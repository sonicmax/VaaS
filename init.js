/*
 *	Initial setup
 */

"use strict"
 
const LOCAL_HOST = 3000;
 
var fs = require("fs");
var express = require("express");
var bodyParser = require("body-parser");
var request = require('request');
var redisClient = require('redis').createClient(process.env.REDIS_URL);

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.cachedData = { "post": "" }; // Basic format for JSON response

var routes = require("./routes/routes.js")(app);

var deployTarget = process.env.PORT || LOCAL_HOST;

var server = app.listen(deployTarget, () => {
	app.generateMarkovChain();
});

var input = ["how was the smokeout last night dandan", "im a weed n00b i just smoke out of this", "its actually p gut bc its indiscreet in public", 
"it looks like im vaping but little do they know im actually blazing", "100 DABS ||| DoNE QUICK }}}}}", "welcome our newest budbomb", 
"how big are we talking about here", "oh so hes obese or smth", "um, am i missing something here", 
"is the word 'big' being understood under a doifferent context",
"my first assumption when i read that post like an hour ago was that it was typo'd autocorrected 'busy' -> 'big' but i just wanted to talk about dicks",
"oh ok", "confusing usage of pronouns in that last bit", "stop validating his weird mind", 
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
"she does.. im the coolest kid on the block she sayas", "she told me not to listen to bullies bbeacause theyre just jhealous of how cool i am",
"my only options were beam, wild turkey 101, seagrams, and $80 japanese whiskeys", "just as a spade is a spade, bae is bae",
"i refuse to eat any japanese food here in the states anymore after going to japan lol", "not up to much, just chilling and posting",
"is there a better way to arrange my figs beyond buying one of those fancy glass display cases lmfao", "u had me at slice of life",
"like, theyre just stock acharacters like eveyrone execpt chino but their voices are so funcking funny",
"yes but as u know thy worships at the altar of shaft so its inflated if u dont take those out",
"all i keep thinking about whenever the word taiga is posted are zola jesus lp and fema", "what did you eat 2day remilia",
"barely at all. starting aria and taht shaft comedy soon, i hope", 
"i got moeshamed so hard the past 48 hours ive been forced to re-evaluate how moe fits into my life", 
"nah, i just aped it from a simpsons episode lolz", "im sober as fuck im drinking water and eating eggplant lasadgnea",
"is it true that most ppl in japan dont have hi-res monitors and thats why all LNs only run at like 1280x800 or w/e",
"ive been off weed for a week though admittedly i went on a bit of a bender the past few weeks trying to quit smoking",
"clean from alcohol since end of last year", "132 days clean off dissociatives", "ive literaly never seeen remi w/o a remi avy", 
"this is the first time iver seen shimakaze-cock4.png", "LMfao i cant beleive that got approved by a mod", "who posted this",
"the whole time i was in nara park all i could think about was gpideal saying 'theres no dere' when i call him out for being so tsundere for me",
"obama is the worst president weve ever had", "the worst", "hes hitler", 
"its time to make amkerica great agaign donald trumps, vote for donald trumps", 
"i was playgin the last of us earlier w/ this guy in atlanta and he was like 'damn dawg atlanta fuckin stinks. every time i step outside it smells like dead animals and shit'",
"SHug hollerworth cruzed past u guys on his skatebord then did a ollie and jumped on a rale and did a sic azz grind",
"dont baeshame", "i still cant stop luaghing at the thought of an aldis selling a million diff kinds of staples",
"blow up From Software headquarters and destroy ever y existign of Souls games in cluding their source code",
"i think thats why i love xray cervical cumshot hentai so much", "30 tokens - suck a cock (changelog)",
"yea this is a weird one... it's a plant lol. like, tobacco is a plant too and it kills", 
"i dont even know what a grinder looks like.. i just keep picturing like... a cheese grater.. . or those peppercorn grinders",
"if i do it w/ only my fingers though, i get a bunmch of sticky icky on m y fingers . feel like that's wasting thc",
"do you think when zizek watched madoka he wanted to fuck mami", "please fuck me antigone", "am i really that inscrutable",
"why does he think i'm so impenetrable", "i wnat to fuck kurisu", "too late im sexualizing her", 
"im down to my last 7 packs of filtered lucky strikes", 
"its all i smoked in japan last summer and then i bought two cartons at the duty free shop otw back",
"it boggles the mind how come they dont sell them here in the states. i mean, lucky strikes originated here",
"if u have sex iwth me there will be anime in palestine", "in fact were polar opposites thats why im so attracted",
"no im not im perfectly coherent see i can post that perfectly coherently idiot!", "its just so hopeless that theres israel",
"my love is a fucking stapler", "fuwa fuwa fucking time", "big babbums bernie", "I HATE THEM HTEY WATCH THE DUB",
"i used to drive and then i wereckd my car LOL", "it's just so hopeless that there's such a situation in the middle east",
"lets ship anime over 2 them", "auote this post if u fickkuning love k-on", 
"lmao i subjected myself to first page of the mal speculation thread for the klk ova today and they all said its gonna be slice of life its gonan Own",
"the hentai rabbit hole how deep does it go idk wanna know", 
"im a stupid mornono with an lughly face and a big butt and my butt smells any i liek to kiss my own butt", 
"duy snap me a vid of yr. cock w/ u saying u lak what u see", 
"my posts are far more emotional than yours, which are by contrast essentially pavlovian responses to seeing neckties and hearing the japanese language", 
"ive done nothing all day but pace around and taking apart small pens so that i can have something in my mouth", 
"also at the time i was probably embroiled in some dumb anime thing", 
"need tips to improve my negging gpideal technique", 
"and make power rankings for the dozen sauces", 
"its dumb but its memorable. thats what they wanted i guess", 
"lmafao for some reason i really want a pack of extra long KOOLS rn", 
"its not the butt its the camel toe. i dont stare at girls bottoms, all i know about this phenomenon is from a bill burr bit about it", 
"i really dont like drinking there bc its kind of pricey for what you get and i dont like german and danish biers which is p much all they have since its a sausage place", 
"ive raised rabbits and fish and gpigs before", "i like my anime the way i like my sexual partners", 
"i have tatami galaxy downloaded but all ive done the past week is lament the death of my dick and rewatch k-on!! and play the last of us mp and listen to the k-on soundtrack and drink myself to sleep", 
"lmao i've watched the entirety of k-on! and k-on!! twice in the past month", "is it possible to say the word 'onodera' outloud without laughing", 
"scientists have studied brain patterns and receptors and have deduced that quenching ones thirst with ice water triggers the same chem reaction as a low dose of IV opiates", 
"lmfao im just lying in bed here bc i missed happy hour where i was gonna order 6 $1 oysters and a bottle of cerveza", 
"i spetn all day cleaning my room and now i just want cigs but im too lazy and broke to go out and buy a pack. i should just bu y looseleaf tobacco in bulk online and roll m y own", 
"if u want a 100% guaranteed way of makign me crack up, just say 'vesper lovestreams' aloud", 
"when gpideal says theres no dere what she actually means is theres no deer", 
"all my cjs are dead ive been reduced to posting in king bills stuffs topic", 
"king bill is cool in my book, he explained v. succinctly my burning question about anime mouths being drawn 'unclosed'", 
"hes a regular in the motto motto anime babes topci", "i dont know why i keep reading nekrodev ecchi reaction posts", 
"no i liek reading his reactions to ecchi", 
"or at leasst put jackos rageface meme i nthere somewehre as an easter egg", 
"sitting on a bus and just realized 'waltz #2' by e. smith is me and gpideals song", 
"actually it might just be the edible brownie i ate ", 
"its hard to articulate but htere are so many moemensts where its so godddamn moe that i just have to say 'this is fucking stupid!!!' aloud w/ a big grin on my faec", 
"i cant fucking believe i spent the last 40 minutes tryjng to catch this motherfucking moth befause its apretty beautiful creature but also terrifying since its Fucking the Size of my Palm", 
"aldis is finally expanding out west. it was a lot less trashy than i expected. kept trying to channel my inner jngy but something just didnt seem right", 
"its nothing derogatory or anythign i ju st love it when black ppl love the 'me", 
"like , its one of the most beautiful pairings . like dark chocolate and strawberries", 
"oh com on, TELL ME that classic meme vid of that baddass black kid earnerstly tryign to go 'super saiayn' for like 8 minutes straight doesnt make u feel good", 
"is this like that thing wher eeveyrone thinks im being racist for laughing @ anime girls saying common japanese expressions when in fact im laughing because it's unbearably precious and adorable and its the only way my body knows how to react to such levels of moe", 
"i glossed over the post and missed the part about starbucks so i just pictured like a pepperoncini pepper for dogs for 'puppurchino'", 
"like, do a maneuver where u quickly move your mouth to the end of the joint and suck it in", 
"i dont think its my physical tolerance so much as it is that i want to feel dissociated but thats kind of impossible with weed so im just trying to get as psychadelic as possible which i guess i s really tough with dispensary weed", 
"which sounds counterintuitive but if anyones been addicted to drugs you'll kiknow what i mean", 
"also ive got a lot of computer shit lyting around, cables and adapters and external hard disks and stuff", 
"i meant like, give them a sleeping pill so that they arent freaking out being alone during the daytime", 
"im not feeding my feuture kitten sleeping pills relax ", "im wearing a lumberjack black red flannel. its meant for a girl. its a girls shirt", 
"i dont want to rabbit utena bc of the lag and dropouts and compression. i need the BDrip for this one", "did jngy drown all the kittens", 
"can cats' whiskers be trimmed", 
"i want to stop spending a bunch of cash on weed and instead put that into a kitty so i can quit weed and nicotine altogether", 
"um ownership o/ this is illegal im not posting a video of myself firing it", "Just bought a silenced shotgun (pics)"];

redisClient.on("connect", () => {
		
		client.lrange('quotes', 0, -1, (error, items) => {
			
			if (error) {
				console.log("couldn't find quotes on redis");
				redisClient.rpush.apply(redisClient, ["quotes"].concat(input).concat(() => { console.log("Input stored to redis") }));
			}
			
			else {
				console.log("redis already set up");
				console.log(items.length);
			}
			
		});				
});

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
			var wordToCheck = sentenceToCheck[j];
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
		// Kludgy fix - return empty string.
		return "";
	}
};