/**
 * Created by daankets on 16/08/14.
 */
(function streamsModule() {
	"use strict";

	var Bacon = require("baconjs"),
		tessel = require("tessel"),
		common = require("./common");

	/**
	 * Creates a new digital PIN stream, for the specified digital pin and optional name.
	 * @param digitalPin
	 * @param name [{string}] Optional name for the event
	 */
	var digitalPinInputStream = function (digitalPin, name, interval) {
		var valueStream;
		var button = tessel.button === digitalPin;
		var riseAndFall = button ? {rise: "press", fall: "release"} : {rise: "rise", fall: "fall"};
		if (interval) {
			digitalPin.input();
			valueStream = Bacon.fromPoll(interval, function () {
				var value = digitalPin.read() ? true : false;
				return new Bacon.Next(value);
			});
		} else {
			valueStream = Bacon.fromEventTarget(digitalPin, riseAndFall.rise, function () {
				return true;
			}).merge(Bacon.fromEventTarget(digitalPin, riseAndFall.fall, function () {
				return false;
			}));
		}
		return common.eventStream(valueStream, {source: name, type: "digitalPin", interval: interval}, function (value, event) {
			event.volt = value ? 3.3 : 0;
			event.level = value ? "high" : "low";
		}, true);
	};

	/**
	 * Creates a new digital PIN stream, for the specified digital pin and optional name.
	 * @param digitalPin
	 */
	var digitalPinOutputBus = function (digitalPin) {
		var bus = new Bacon.Bus();
		bus.onValue(function (value) {
			var v = value;
			if (typeof value === "object" && value.hasOwnProperty("value")) {
				v = v.value;
			}
			digitalPin.write(v);
		});
		return bus;
	};

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

	var buttonInputStream = function (buttonPin, name) {
		return common.eventStream(digitalPinInputStream(buttonPin), {source: name, type: "button"}, function (value, event) {
			event.state = value ? "down" : "up";
		});
	};

	module.exports = {
		digitalPinInputStream: digitalPinInputStream,
		digitalPinOutputBus: digitalPinOutputBus,
		analogPinInputStream: analogPinInputStream,
		buttonInputStream: buttonInputStream,
		climate: require("./climate"),
		ambient: require("./ambient"),
		relay: require("./relay"),
		common: common
	};

}());