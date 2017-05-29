# AC-Controller
The air conditioning unit in my window is either on or off. This adds a little bit of logic to try and keep the room at a reasonable temperature. 

An Arduino with an ethernet shield and a temperature sensor sits in the middle of the room and responds to GET requests with the current temperature in JSON form. 

I'm using a 5 year old $1.50 thermistor [(Sparkfun)](http://www.sparkfun.com/products/10988) which is sensitive to voltage flucutations and seems to consistently run about 8°F higher than room temperature. 

A Raspberry Pi runs a Node.js program which queries the Arduino for the temperature, logs it to [ThingSpeak.com](https://thingspeak.com/channels/279117/) and turns the AC on and off accordingly using a [Powertail](http://www.powerswitchtail.com).

The manual says that the AC's compressor requires a 3 minute cooldown time, I've bumped that up to 16 minutes so it isn't constantly turning on and off again.

Once the AC turns on, it attempts to bring the room temperature down to THRESHOLD - GOAL. In my caase THRESHOLD = 85 and GOAL = 5, so the AC runs until room temperature = 80F. 

# TODO:
Add a humidity sensor so I can quantitatively measure just how *steamy* things really are.  
