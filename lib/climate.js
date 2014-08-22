/**
 * Created by daankets on 21/08/14.
 */

(function climateModule() {
	"use strict";

	var Bacon = require("baconjs"),
		common = require("./common.js");

	var temperatureInputStream = function (climateModule, options) {
		var factor = Math.pow(10, (options.decimals || 2));
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
		}, options.interval || 500);
		return common.eventStream(temperatureBus, {type: "temperature", calibrated: false, source: options.name}, function (value, event) {
			event.calibrated = (climateModule.temperatureDiff !== undefined);
		}, true);
	};

	var humidityInputStream = function (climateModule, options) {
		var factor = Math.pow(10, (options.decimals || 2));
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
		}, options.interval || 500);
		return common.eventStream(humidityBus, {type: "humidity", source: options.name}, function (value, event) {
			event.calibrated = (climateModule.humidityDiff !== undefined);
		}, true);
	};

	var climateInputStream = function (climateModule, options) {
		return temperatureInputStream(climateModule, options).merge(humidityInputStream(climateModule, options));
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

	var ClimateModule = function (tesselClimateModule, options) {
		this._module = tesselClimateModule;
		this._options = options || {};
		this._options = {
			name: options.name || 'climate',
			interval: options.interval || 500,
			decimals: options.decimals || 2
		};
	};

	ClimateModule.prototype.input = function () {
		if (!this._inputStream) {
			this._inputStream = climateInputStream(this._module, this._options);
		}
		return this._inputStream;
	};

	ClimateModule.prototype.output = function () {
		if (!this._output) {
			this._output = climateOutputBus(this._module);
		}
		return this._output;
	};

	ClimateModule.use = function (port) {
		return new ClimateModule(port);
	};

	module.exports = ClimateModule;
}());