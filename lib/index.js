/**
 * Created by daankets on 16/08/14.
 */
(function () {
	"use strict";

	var Bacon = require("baconjs");
	var tessel = require("tessel");

	var value = function (value, name, time) {
		return {
			value: value,
			name: name,
			time: time || new Date().getTime()
		};
	};

	/**
	 * Creates a new digital PIN stream, for the specified digital pin and optional name.
	 * @param digitalPin
	 * @param options [{{[name]:{String}, [interval]: {Number}}]
	 */
	var digitalPinStream = function (digitalPin, options) {
		var name = (options && options.name) || undefined;
		if (options && options.interval) {
			var self = this;
			return Bacon.fromPoll(options.interval, function () {
				return new Bacon.Next(value(name, digitalPin.read()));
			});
		} else {
			return Bacon.fromEventTarget(digitalPin, "change", function digitalPinTriggerTransformer(time, change) {
				console.log("Digital pin change :" + change);
				return value((change === "rise" ? 1 : 0), name, time);
			});
		}
	};

	var buttonStream = function (button, options) {
		var name = options && options.name || undefined;
		var longTime = options && options.longTime || undefined;
		var lastDown = Number.MAX_VALUE;
		var long = new Bacon.Bus();
		return Bacon.fromEventTarget(button, "press", function (time) {
			lastDown = time;
			return value("down", name, time);
		}).merge(Bacon.fromEventTarget(button, "release", function (time) {
			if (longTime && ((time - lastDown) > longTime)) {
				long.push(value("long", name, time));
			}
			return value("up", name, time);
		})).merge(long);
	};

	digitalPinStream(tessel.led[0], {name: "Digital pin one"}).onValue(function (value) {
		console.log(JSON.stringify(value));
	});

	buttonStream(tessel.button, {name: "button", longTime: 100000}).onValue(function (value) {
		console.log(JSON.stringify(value));
	});

	console.log(tessel.led[0].type);
	console.log(tessel.led[0].read());

	(function blink(value) {
		tessel.led[0].write(value);
		setTimeout(blink, 2000, !value);
	}(true));

	module.exports = {
		digitalPinStream: digitalPinStream,
		buttonStream: buttonStream
	};

}());