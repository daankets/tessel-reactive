/**
 * Created by daankets on 21/08/14.
 */
(function reactiveExample() {
	"use strict";
	var SKIP_DUPLICATES = true;

	console.info("This example assumes a climate module on port B, ambient on port C, relay on port A and a pushbutton on GPIO G4 (&GND):");

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

	var button2InputStream = tr.buttonInputStream(tessel.button, "button 2");
	var largeButtonInputPin = tr.digitalPinInputStream(tessel.port.GPIO.pin.G4, "digital GPIO:G4", 250);

	/*
	 setInterval(function () {
	 console.log("G4:" + largeButtonInputPin.read());
	 }, 1000);
	 */

	//largeButtonInputPin.input(); // Configure as input.
	var largeButtonInputStream = tr.common.eventStream(largeButtonInputPin, {source: "large button", type: "button"}, function (value, event) {
		return (value === false);
	}, false);

	var led1OutputStream = tr.digitalPinOutputBus(tessel.led[1]);

	led1OutputStream.plug(button2InputStream);

	var motionStream = tr.common.eventStream(button2InputStream, {type: "motion", source: "pir"},
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

	var inputs = button2InputStream.merge(motionStream).merge(climateStream).merge(ambientStream).merge(relay1InputStream).merge(largeButtonInputStream);

	inputs.onValue(function (value) {
		console.log(JSON.stringify(value));
	});
}());
