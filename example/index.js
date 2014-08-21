/**
 * Created by daankets on 21/08/14.
 */
(function reactiveExample() {
	"use strict";
	var SKIP_DUPLICATES = true;

	var tessel = require("tessel"),
		tr = require("../lib"),
		wifi = require("wifi-cc3000"),
		http = require("http");

	var sensors = {};

	var registerSensor = function (name, stream) {
		sensors[name] = {name: stream, stream: stream};
	};

	var removeSensor = function (name) {
		delete sensors[name];
	};

	process.on("uncaughtException", function (err) {
		console.error(err);
	});

	var button = tr.buttonInputStream(tessel.button, "button 2");
	var led1Output = tr.digitalPinOutputBus(tessel.led[1]);

	led1Output.plug(button);

	var motion = tr.common.eventStream(button, {type: "motion", source: "pir"},
		function (value, event) {
			event.state = value ? "motion" : "no motion";
		}
	);

	var climate = tr.climate.climateInputStream(tessel.port.B, "climate B", 1000, 1, SKIP_DUPLICATES);
	var ambient = tr.ambient.ambientInputStream(tessel.port.C, "ambient C", 1000, 1, SKIP_DUPLICATES);

	var total = button.merge(motion).merge(climate).merge(ambient);

	total.onValue(function (value) {
		console.log(JSON.stringify(value));
	});
}());
