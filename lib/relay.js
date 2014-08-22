/**
 * Created by daankets on 21/08/14.
 */

(function relayModule() {
	"use strict";

	var Bacon = require("baconjs"),
		common = require("./common.js");

	var relayOutputBus = function (relayModule, options) {
		var bus = new Bacon.Bus();
		relayModule.on("ready", function () {
			bus.onValue(function (relayCommand) {
				switch (relayCommand.value) {
				case true:
					relayModule.turnOn(options.channel);
					break;
				default:
				case false:
					relayModule.turnOff(options.channel);
					break;
				}
			});
		});
		return bus;
	};

	var relayInputStream = function (relayModule, options) {
		return common.eventStream(Bacon.fromEventTarget(relayModule, "latch", function (channelNumber, state) {
			return state;
		}), {source: options.name, type: "relayState"}, function transformRelayEvent(value, event) {
			event.latch = value ? "closed" : "open";
			event.channel = options.channel;
		}, true);
	};

	var RelayModule = function (tesselRelayModule, options) {
		this._module = tesselRelayModule;
		this._options = options || {};
		this._options.channel = this._options.channel || 1;
	};

	RelayModule.prototype.input = function () {
		if (!this._input) {
			this._input = relayInputStream(this._module, this._options);
		}
		return this._input;
	};

	RelayModule.prototype.output = function (value) {
		if (!this._output) {
			this._output = relayOutputBus(this._module);
		}
		if (value !== undefined) {
			this._output.push(value);
		}
		return this._output;
	};

	module.exports = RelayModule;


}());