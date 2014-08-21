/**
 * Created by daankets on 21/08/14.
 */

(function climateModule() {
	"use strict";

	var Bacon = require("baconjs"),
		common = require("./common.js");


	var lightLevelInputStream = function (ambientModule, name, interval, decimals, skipDuplicates) {
		var lightLevelBus = new Bacon.Bus();
		var factor = Math.pow(10, (decimals || 2));
		ambientModule.on("ready", function () {
			setInterval(function () {
				ambientModule.getLightLevel(function (err, light) {
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

	var soundLevelInputStream = function (ambientModule, name, interval, decimals, skipDuplicates) {
		var factor = Math.pow(10, (decimals || 2));
		var soundLevelBus = new Bacon.Bus();
		ambientModule.on("ready", function () {
			setInterval(function () {
				ambientModule.getSoundLevel(function (err, sound) {
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

	var ambientInputStream = function (ambientModule, name, interval, decimals, skipDuplicates) {
		return lightLevelInputStream(ambientModule, name, interval, decimals, skipDuplicates).merge(soundLevelInputStream(ambientModule, name, interval, decimals, skipDuplicates));
	};

	module.exports = {
		lightLevelInputStream: lightLevelInputStream,
		soundLevelInputStream: soundLevelInputStream,
		ambientInputStream: ambientInputStream
	};
}());