/**
 * Created by daankets on 21/08/14.
 */
(function reactiveExample() {
	"use strict";

	var tessel = require("tessel"),
		tr = require("../lib");

	process.on("uncaughtException", function (err) {
		console.error(err);
	});

	tr.buttonInputStream(tessel.button, "button 2").onValue(function (event) {
		console.log(JSON.stringify(event));
		tessel.led[1].write(event.value);
	});

	tr.climate.climateInputStream(tessel.port.B, "climate B", 1000).onValue(function (event) {
		console.log(JSON.stringify(event));
	});

	tr.ambient.ambientInputStream(tessel.port.C, "ambient C", 1000).onValue(function (event) {
		console.log(JSON.stringify(event));
	});

	(function blink(value) {
		tessel.led[0].write(value);
		setTimeout(blink, 500, !value);
	}(true));

}());
