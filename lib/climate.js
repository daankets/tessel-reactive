/**
 * Created by daankets on 21/08/14.
 */

(function climateModule() {
	"use strict";

	var Bacon = require("baconjs"),
		common = require("./common.js");

	var temperatureInputStream = function (climateModule, name, interval, decimals, skipDuplicates) {
		var factor = Math.pow(10, (decimals || 2));
		var temperatureBus = new Bacon.Bus();
		setInterval(function () {
			climateModule.readTemperature(function (err, temp) {
				if (err) {
					console.error(err);
					return;
				}
				if (climateModule.temperatureDiff) {
					temp = temp - climateModule.temperatureDiff;
				}
				temp = Math.round(temp * factor) / factor;
				temperatureBus.push(temp);
			});
		}, interval);
		return common.eventStream(temperatureBus, {type: "temperature", calibrated: false, source: name}, function (value, event) {
			event.calibrated = (climateModule.temperatureDiff !== undefined);
		}, skipDuplicates);
	};

	var humidityInputStream = function (climateModule, name, interval, decimals, skipDuplicates) {
		var factor = Math.pow(10, (decimals || 2));
		var humidityBus = new Bacon.Bus();
		setInterval(function () {
			climateModule.readHumidity(function (err, humidity) {
				if (err) {
					console.error(err);
					return;
				}
				if (climateModule.humidityDiff) {
					humidity = humidity - climateModule.humidityDiff;
				}
				humidity = Math.round(humidity * factor) / factor;
				humidityBus.push(humidity);
			});
		}, interval);
		return common.eventStream(humidityBus, {type: "humidity", source: name}, function(value, event){
			event.calibrated = (climateModule.humidityDiff !== undefined);
		}, skipDuplicates);
	};

	var climateInputStream = function (climateModule, name, interval, decimals, skipDuplicates) {
		return temperatureInputStream(climateModule, name, interval, decimals, skipDuplicates).merge(humidityInputStream(climateModule, name, interval, decimals, skipDuplicates));
	};

	var temperatureOutputBus = function (climateModule) {
		var bus = new Bacon.Bus();
		bus.onValue(function (value) {
			if (value) {
				if (value.type === "temperature" || value.type === "temperatureDifference") {
					if (typeof value.value === "number") {
						climateModule.readTemperature(function (err, temp) {
							if (err) {
								console.error(err);
								return;
							}
							climateModule.temperatureDiff = value.type === "temperature" ? temp - value.value : value.value;
						});
					}
				}
			}
		});
		return bus;
	};

	var humidityOutputBus = function (climateModule) {
		var bus = new Bacon.Bus();
		bus.onValue(function (value) {
			if (value) {
				if (value.type === "humidity" || value.type === "humidityDifference") {
					if (typeof value.value === "number") {
						climateModule.readHumidity(function (err, humidity) {
							if (err) {
								console.error(err);
								return;
							}
							climateModule.humidityDiff = value.type === "humidity" ? humidity - value.value : value.value;
						});
					}
				}
			}
		});
		return bus;
	};

	var climateOutputBus = function (climateModule) {
		var bus = new Bacon.Bus();
		temperatureOutputBus(climateModule).plug(bus.filter(function (command) {
			return (command && (command.type === "temperature" || command.type === "temperatureDifference"));
		}));

		humidityOutputBus(climateModule).plug(bus.filter(function (command) {
			return (command && (command.type === "humidity" || command.type === "humidityDifference"));
		}));
		return bus;
	};

	module.exports = {
		temperatureInputStream: temperatureInputStream,
		humidityInputStream: humidityInputStream,
		climateInputStream: climateInputStream,
		climateOutputBus: climateOutputBus,
		temperatureOutputBus: temperatureOutputBus,
		humidityOutputBus: humidityOutputBus
	};
}());