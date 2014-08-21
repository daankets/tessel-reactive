/**
 * Created by daankets on 21/08/14.
 */

(function relayModule() {
	"use strict";

	var Bacon = require("baconjs"),
		common = require("./common.js");

	var relayOutputBus = function (relayModule, channelNumber) {
		var bus = new Bacon.Bus();
		relayModule.on("ready", function () {
			bus.onValue(function (relayCommand) {
				switch (relayCommand.value) {
					case true:
						relayModule.turnOn(channelNumber);
						break;
					default:
					case false:
						relayModule.turnOff(channelNumber);
						break;
				}
			});
		});
		return bus;
	};

	var relayInputStream = function (relayModule, name, relayNumber) {
		return common.eventStream(Bacon.fromEventTarget(relayModule, "latch", function (channelNumber, state) {
			return state;
		}), {source: name, type: "relay"}, function transformRelayEvent(value, event) {
			event.latch = value ? "closed" : "open";
			event.channel = relayNumber;
		}, true);
	};

	module.exports = {
		relayInputStream: relayInputStream,
		relayOutputBus: relayOutputBus
	};


}());