/**
 * Created by daankets on 21/08/14.
 */
(function reactiveExample() {
	"use strict";
	var SKIP_DUPLICATES = true;

	var tessel = require("tessel"),
		tr = require("../lib"),
		climate = require("climate-si7020"),
		ambient = require("ambient-attx4"),
		wifi = require("wifi-cc3000"),
		relay = require("relay-mono"),
		http = require("http");

	var modules = {
		climateB: climate.use(tessel.port.B),
		ambientC: ambient.use(tessel.port.C),
		relayA: relay.use(tessel.port.A)
	};

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

	var buttonStream = tr.buttonInputStream(tessel.button, "button 2");
	var led1OutputStream = tr.digitalPinOutputBus(tessel.led[1]);

	led1OutputStream.plug(buttonStream);

	var motionStream = tr.common.eventStream(buttonStream, {type: "motion", source: "pir"},
		function (value, event) {
			event.state = value ? "motion" : "no motion";
		}
	);

	var climateStream = tr.climate.climateInputStream(modules.climateB, "climate B", 1000, 1, SKIP_DUPLICATES);
	var ambientStream = tr.ambient.ambientInputStream(modules.ambientC, "ambient C", 1000, 1, SKIP_DUPLICATES);

	var relay1InputStream = tr.relay.relayInputStream(modules.relayA, "relay A", 1);
	var relay1OutputBus = tr.relay.relayOutputBus(modules.relayA, 1);

	var climateOutputBus = tr.climate.climateOutputBus(modules.climateB);

	// Calibrate temperature
	climateOutputBus.push({type: "temperatureDifference", value: 6.3});
	climateOutputBus.push({type: "humidityDifference", value: -12.6});

	var inputs = buttonStream.merge(motionStream).merge(climateStream).merge(ambientStream).merge(relay1InputStream);

	inputs.onValue(function (value) {
		console.log(JSON.stringify(value));
	});
}());
