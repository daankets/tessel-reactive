/**
 * Created by daankets on 22/08/14.
 */

(function buttonModule() {
	"use strict";

	var common = require("./common");

	var buttonInputStream = function (buttonPin, options) {
		return common.eventStream(buttonPin.input(), {source: options.name, type: "button"}, function (value, event) {
			value = (value !== (options.pinMode === "pullup"));
			event.state = value ? "down" : "up";
			return value;
		});
	};

	var Button = function (digitalPin, options) {
		this._digitalPin = digitalPin;
		this._options = options;
		this._options.pinMode = digitalPin.getPinMode();
	};

	Button.prototype.input = function () {
		if (!this._input) {
			this._input = buttonInputStream(this._digitalPin, this._options);
		}
		return this._input;
	};

	module.exports = Button;

}());