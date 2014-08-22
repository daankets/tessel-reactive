/**
 * Created by daankets on 22/08/14.
 */
(function moduleName() {
	"use strict";

	var Bacon = require("baconjs"),
		common = require("./common"),
		tessel = require("tessel");

	/**
	 * Creates a new digital PIN stream, for the specified digital pin and optional name.
	 * @param digitalPin
	 * @param options [{string}] Optional name for the event
	 */
	var digitalPinInputStream = function (digitalPin, options) {
		var valueStream;
		var button = tessel.button === digitalPin;
		var riseAndFall = button ? {rise: "press", fall: "release"} : {rise: "rise", fall: "fall"};

		if (options.interval) {
			valueStream = Bacon.fromPoll(options.interval || 500, function () {
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
		return common.eventStream(valueStream, {source: options.name, type: "digitalPin", interval: options.interval || 500}, function (value, event) {
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

	var DigitalPin = function (tesselPin, options) {
		this._pin = tesselPin;
		this._options = options || {};
	};

	DigitalPin.prototype.getPinMode = function() {
		return this._pin.mode();
	};

	DigitalPin.prototype.input = function () {
		if (!this._input) {
			this._input = digitalPinInputStream(this._pin, this._options);
		}
		return this._input;
	};

	DigitalPin.prototype.output = function (value) {
		if (!this._output) {
			this._output = digitalPinOutputBus(this._pin);
		}
		if (value !== undefined) {
			this._output.push(value);
		}
		return this._output;
	};

	module.exports = DigitalPin;

}());
