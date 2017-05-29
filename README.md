# AC-Controller
The air conditioning unit in my window is either on or off. This adds a little bit of logic to try and keep the room at a reasonable temperature. 

An Arduino with an ethernet shield and a temperature sensor sits in the middle of the room and responds to GET requests with the current temperature in JSON form. 

I'm using a 5 year old $1.50 thermistor [(Sparkfun)](http://www.sparkfun.com/products/10988) which is sensitive to voltage flucutations and seems to consistently run about 8°F higher than room temperature. 

A Raspberry Pi runs a Node.js program which queries the Arduino for the temperature, logs it to [ThingSpeak.com](https://thingspeak.com/channels/279117/) and turns the AC on and off accordingly. 
