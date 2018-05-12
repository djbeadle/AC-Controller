var config = {};

config.interval = 150000;
config.control_pin = 26;

config.threshold = 74;
config.goal = 5;

config.min_time_on = 180000; // 30 minutes
config.max_time_on = 3600000; // 1 hour
config.min_time_off = 1000000; // According to manual compressor needs 3 minutes between being turned off and back on again. This is a healthy 5.

module.exports = config;
