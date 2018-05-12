'use strict';

var request = require("request");
var config = require("./config");
var gpio = require('rpi-gpio');

// System variables:
var ac_state = 0; // -1 = off, 1 = on

var temp_json = "";
var interval = 30000;

var time_turned_on = -1;
var time_turned_off = -1;

// Setup:
gpio.setup(config.control_pin, gpio.DIR_OUT, write_off);

// Operation:
console.log("System Online");
console.log("Interval: " + interval);

// Gets the current temperature
function update_temp(){
	console.log("| Updating Temp at " + new Date);
	request('http://192.168.1.151', function (error, response, body) {
			console.log('| error:', error); // Print the error if one occurred
			console.log('| statusCode:', response && response.statusCode); // Print the response status code if a response was received
			temp_json = JSON.parse(body);
			})
	console.log("");
};

function write_on() {
	gpio.write(config.control_pin, true, function(err) {
			ac_state = 1;
			console.log('Pin on!');
			});
}

function write_off() {
	gpio.write(config.control_pin, false, function(err) {
			ac_state = -1;
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
			console.log("* "+ temp_json.fahrenheit + " < config.threshold (" + config.threshold + ")");
			write_off();
			time_turned_off = (+new Date);
		}
	}
	console.log("");
}
