/**
 * Created by daankets on 21/08/14.
 */

(function climateModule() {
	"use strict";

	var ambient = require("ambient-attx4"),
		Bacon = require("baconjs"),
		common = require("./common.js");

	var modules = {};

	var getModule = function (port) {
		if (!modules.hasOwnProperty(port.id)) {
			modules[port.id] = ambient.use(port);
		}
		return modules[port.id];
	};

	var lightLevelInputStream = function (port, name, interval, decimals, skipDuplicates) {
		var lightLevelBus = new Bacon.Bus();
		var factor = Math.pow(10, (decimals || 2));
		getModule(port).on("ready", function () {
			setInterval(function () {
				getModule(port).getLightLevel(function (err, light) {
					if (err) {
						console.error(err);
						return;
					}
					lightLevelBus.push(Math.round(light * factor) / factor);
				});
			}, interval);
		});

		return common.eventStream(lightLevelBus, {type: "lightLevel", source: name}, undefined, skipDuplicates);
	};

	var soundLevelInputStream = function (port, name, interval, decimals, skipDuplicates) {
		var factor = Math.pow(10, (decimals || 2));
		var soundLevelBus = new Bacon.Bus();
		getModule(port).on("ready", function () {
			setInterval(function () {
				getModule(port).getSoundLevel(function (err, sound) {
					if (err) {
						console.error(err);
						return;
					}
					soundLevelBus.push(Math.round(sound * factor) / factor);
				});
			}, interval);
		});

		return common.eventStream(soundLevelBus, {type: "soundLevel", source: name}, undefined, skipDuplicates);
	};

	var ambientInputStream = function (port, name, interval, decimals, skipDuplicates) {
		return lightLevelInputStream(port, name, interval, decimals, skipDuplicates).merge(soundLevelInputStream(port, name, interval, decimals, skipDuplicates));
	};

	module.exports = {
		lightLevelInputStream: lightLevelInputStream,
		soundLevelInputStream: soundLevelInputStream,
		ambientInputStream: ambientInputStream
	};
}());