/**
 * Created by daankets on 21/08/14.
 */

(function climateModule() {
	"use strict";

	var Bacon = require("baconjs"),
		common = require("./common.js");


	var lightLevelInputStream = function (ambientModule, options) {
		var lightLevelBus = new Bacon.Bus();
		var factor = Math.pow(10, (options.decimals || 2));
		ambientModule.on("ready", function () {
			setInterval(function () {
				ambientModule.getLightLevel(function (err, light) {
					if (err) {
						console.error(err);
						return;
					}
					lightLevelBus.push(Math.round(light * factor) / factor);
				});
			}, options.interval || 500);
		});

		return common.eventStream(lightLevelBus, {type: "lightLevel", source: options.name}, undefined, true);
	};

	var soundLevelInputStream = function (ambientModule, options) {
		var factor = Math.pow(10, (options.decimals || 2));
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
			}, options.interval || 500);
		});

		return common.eventStream(soundLevelBus, {type: "soundLevel", source: options.name }, undefined, true);
	};

	var ambientInputStream = function (ambientModule, options) {
		return lightLevelInputStream(ambientModule, options).merge(soundLevelInputStream(ambientModule, options));
	};

	var AmbientModule = function (tesselAmbientModule, options) {
		this._module = tesselAmbientModule;
		this._options = options || {};
		this._options = {
			name: options.name || "ambient",
			interval: options.interval || 500,
			decimals: options.decimals || 2
		};
	};

	AmbientModule.prototype.input = function () {
		if (!this._inputStream) {
			this._inputStream = ambientInputStream(this._module, this._options);
		}
		return this._inputStream;
	};

	/*
	 AmbientModule.prototype.output = function () {
	 if (!this._output) {
	 this._output = ambientOutputBus(this._module);
	 }
	 return this._output;
	 };
	 */

	AmbientModule.use = function (port) {
		return new AmbientModule(port);
	};

	module.exports = AmbientModule;
}());