# VaaS
(Vesper as a service)

Demo: http://sonicmax.github.io/VaaS

API: http://vaas.herokuapp.com/

Sample response:

<pre>{ "post": "fhuuump" }</pre>

<i>hey i wanna use this thing!</i>

		1) Download this repo
		2 a) make free Heroku account
		
			b) create a new app, download Heroku Toolbelt and 
					install the Heroku Redis app
					
			c) follow their instructions and copy the contents of this 
					repo into the new one you just created. don't replace any files.
		
		3) go to settings page for your app in Heroku Dashboard and create these Config Variables: 
		
				USERNAME - ETI username
				PASSWORD - ETI password
				TOKEN - used to restrict access to certain parts of the API
				(REDIS_URL should already be there if you remembered to install the Heroku Redis app)
			
				(don't give these out to people you don't trust)
		
		4) compile sample text of sentences separated by linebreaks, 
				and upload to pastebin (bear with me here). keep the raw url handy...
		
		5) go to this URL in your browswer of choice: 
				https://myappname.herokuapp.com/pastebin?token=TOKEN&url=PASTEBIN_RAW_URL
				(responds with <i>{"quotes added": true/false}</i>)
		
		7) visit https://myappname.herokuapp.com/ to see some quick output
		
		8) visit https://myappname.herokuapp.com/testbot?token=TOKEN to post in a random LUE topic 
		
		9) have fun
 