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
				temperatureBus.push(Math.round(temp * factor) / factor);
			});
		}, interval);
		return common.eventStream(temperatureBus, {type: "temperature", source: name}, undefined, skipDuplicates);
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
				humidityBus.push(Math.round(humidity * factor) / factor);
			});
		}, interval);
		return common.eventStream(humidityBus, {type: "humidity", source: name}, undefined, skipDuplicates);
	};

	var climateInputStream = function (climateModule, name, interval, decimals, skipDuplicates) {
		return temperatureInputStream(climateModule, name, interval, decimals, skipDuplicates).merge(humidityInputStream(climateModule, name, interval, decimals, skipDuplicates));
	};

	module.exports = {
		temperatureInputStream: temperatureInputStream,
		humidityInputStream: humidityInputStream,
		climateInputStream: climateInputStream
	};
}());