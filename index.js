'use strict';

var request = require("request");
var config = require("./config");
var thingspeak_config = require("./thingspeak_config");
var ThingSpeakClient = require('thingspeakclient');
var gpio = require('rpi-gpio');

// System variables:
var channelId= thingspeak_config.channel_id;
var ac_state = 0; // -1 = off, 1 = on

var temp_json = "";
var interval = 30000;

var time_turned_on = -1;
var time_turned_off = -1;

// Setup:
var client = new ThingSpeakClient();
client.attachChannel(channelId, { writeKey: thingspeak_config.private_key});
gpio.setup(config.control_pin, gpio.DIR_OUT, write_off);

// Operation:
console.log("System Online");
console.log("Interval: " + interval);

// Updates and logs the temperature to thingspeak.io
function update_temp(){
	console.log("| Updating Temp at " + new Date);
	request('http://192.168.1.151', function (error, response, body) {
			console.log('| error:', error); // Print the error if one occurred
			console.log('| statusCode:', response && response.statusCode); // Print the response status code if a response was received
			// console.log('| body:', body); // Print the HTML we just retreived
			//console.log('body as json:', JSON.parse(body));			
			temp_json = JSON.parse(body);

			console.log("| Temperature value sent to ThingSpeak: " + temp_json.fahrenheit);
			client.updateChannel(channelId, {"field1" : temp_json.fahrenheit, "field2" : ac_state});
			})
	console.log("");
};


function write_on() {
	gpio.write(config.control_pin, true, function(err) {
			ac_state = 1;
			client.updateChannel(channelId, {"field1" : temp_json.fahrenheit, "field2" : ac_state});
			if (err) throw err;
			console.log('Pin on!');
			});
}

function write_off() {
	gpio.write(config.control_pin, false, function(err) {
			ac_state = -1;
			console.log("Updating TS!");
			client.updateChannel(channelId, {"field1" : temp_json.fahrenheit, "field2" : ac_state}, function(err, resp) {
				// This is the only time we do proper error handling for ThingSpeak, probably should add that to TODO
				console.log("err: " + err);
				console.log("resp: " + resp);
				 if (!err && resp > 0) {
    					 console.log('update successfully. Entry number was: ' + resp);
   				 }
			});
			if (err) throw err;
			console.log('Pin off!');
			});
}

update_temp();
setInterval(update_temp, interval);
setInterval(ac_control, interval+ 1000);

// setInterval(sync, interval);

function sync(){
	async.waterfall([
		update_temp,
		ac_control
	], function (err, result){
		console.log("Errors: " + err);
	});
}


// control the AC accordingly
function ac_control(){
	console.log("* Adjusting AC at " + new Date);
	if(ac_state == 1){
		if(temp_json.fahrenheit >= config.threshold - config.goal){
			console.log("* " + temp_json.fahrenheit + " is >= config.threshold - config.goal (" + (config.threshold - config.goal) + "). AC is staying ON.");
			console.log("");
			return;
		} else { 
			console.log("* " + temp_json.fahrenheit + " is < config.threshold - config.goal (" + (config.threshold - config.goal) + "). AC is turning OFF.");
			write_off();
			console.log("");
			return;
		}
	}
	else if(temp_json.fahrenheit >= config.threshold)
	{
		if(time_turned_on == -1){
			time_turned_on = (+ new Date);
			console.log("* Turning AC on for first time!");
			write_on();
		}
		else{
			if((+new Date) - time_turned_off > config.min_time_off){
				time_turned_on = (+ new Date);
				console.log("* Turning AC on!");
				write_on();
			} else {
				console.log("* Temperature is > Threshold, but compressor still cooling down! :(");
			}
		}
	}
	else {
		if(ac_state == 0){
			console.log("* " + temp_json.fahrenheit + " is < config.threshold, and AC is already OFF");
			console.log("");
			return;
		} else {
			console.log("* "+ temp_json.fahrenheit + " < config.threshold");
			write_off();
			time_turned_off = (+new Date);
		}
	}
	console.log("");
}
