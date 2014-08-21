/**
 * Created by daankets on 21/08/14.
 */

(function climateModule() {
	"use strict";

	var climate = require("climate-si7020"),
		Bacon = require("baconjs"),
		common = require("./common.js");

	var modules = {};

	var getModule = function (port) {
		if (!modules.hasOwnProperty(port.id)) {
			modules[port.id] = climate.use(port);
		}
		return modules[port.id];
	};

	var temperatureInputStream = function (port, name, interval) {
		var temperatureBus = new Bacon.Bus();
		setInterval(function () {
			getModule(port).readTemperature(function (err, temp) {
				if (err) {
					console.error(err);
				}
				temperatureBus.push(temp);
			});
		}, interval);
		return common.eventStream(temperatureBus, {type: "temperature", source: name});
	};

	var humidityInputStream = function (port, name, interval) {
		var humidityBus = new Bacon.Bus();
		setInterval(function () {
			getModule(port).readHumidity(function (err, humidity) {
				if (err) {
					console.error(err);
				}
				humidityBus.push(humidity);
			});
		}, interval);
		return common.eventStream(humidityBus, {type: "humidity", source: name});
	};

	var climateInputStream = function (port, name, interval) {
		return temperatureInputStream(port, name, interval).merge(humidityInputStream(port, name, interval));
	};

	module.exports = {
		temperatureInputStream: temperatureInputStream,
		humidityInputStream: humidityInputStream,
		climateInputStream: climateInputStream
	};
}());