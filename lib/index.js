/**
 * Created by daankets on 16/08/14.
 */
(function streamsModule() {
	"use strict";

	var Bacon = require("baconjs"),
		common = require("./common");


	/**
	 * Creates a new digital PIN stream, for the specified digital pin and optional name.
	 * @param analogPin
	 * @param name [{string}] Optional name for the event
	 */
	var analogPinInputStream = function (analogPin, name, interval) {
		var valueStream;
		interval = interval || 500;
		return common.eventStream(Bacon.fromPoll(interval, function () {
			return new Bacon.Next(analogPin.read());
		}), {source: name, type: "analogPin", interval: interval}, function (value, event) {
			event.volt = value * 3.3;
		});
	};

	module.exports = {
		DigitalPin: require("./digitalPin"),
		analogPinInputStream: analogPinInputStream,
		Button: require("./button"),
		ClimateModule: require("./climate"),
		MotionModule: require("./motion"),
		AmbientModule: require("./ambient"),
		RelayModule: require("./relay"),
		common: common
	};

}());