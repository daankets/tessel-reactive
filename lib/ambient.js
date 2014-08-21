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

	var lightLevelInputStream = function (port, name, interval) {
		var lightLevelBus = new Bacon.Bus();
		getModule(port).on("ready", function () {
			setInterval(function () {
				getModule(port).getLightLevel(function (err, light) {
					if (err) {
						console.error(err);
						return;
					}
					lightLevelBus.push(light);
				});
			}, interval);
		});

		return common.eventStream(lightLevelBus, {type: "lightLevel", source: name});
	};

	var soundLevelInputStream = function (port, name, interval) {
		var soundLevelBus = new Bacon.Bus();
		getModule(port).on("ready", function () {
			setInterval(function () {
				getModule(port).getSoundLevel(function (err, sound) {
					if (err) {
						console.error(err);
						return;
					}
					soundLevelBus.push(sound);
				});
			}, interval);
		});

		return common.eventStream(soundLevelBus, {type: "soundLevel", source: name});
	};

	var ambientInputStream = function (port, name, interval) {
		return lightLevelInputStream(port, name, interval).merge(soundLevelInputStream(port, name, interval));
	};

	module.exports = {
		lightLevelInputStream: lightLevelInputStream,
		soundLevelInputStream: soundLevelInputStream,
		ambientInputStream: ambientInputStream
	};
}());