
# Introduction

Tessel reactive is a functional reactive programming library that uses **BaconJS** in order to expose streams for Tessel modules, buttons, pins, …

It allows you to quickly develop for a Tessel.io board in a functional/baconJS style.

# Modules

The library contains classes to work in a reactive style using the following modules and perhiperals. Note that it DOES NOT depend on the required libraries for the supported tessel modules. You have to instantiate those yourself.

Modules provide either input, output or both. The inputs and outputs are BaconJS streams/buses respectively, and provide/consume objects. Each object has a value. For example, a digital pin will produce events with a value true/false depending on the pin state (high/low).

A LED (which is a digital pin set to output) can consume the same values in order to SET the pin state (see example).

## Supported out of the box:

* Digital pin (input/output)
	* Button (input)
	* LED (input/output)
	* Motion/PIR (input)
* Climate (input/output)
	* Inputs
		* Temperature
		* Humidity
		* Heater state
	* Outputs
		* Heater state
		* Temperature calibration
		* Humidity calibration
* Ambient (input)
	* Light level
	* Sound level
* Relay (input/output)
	* Relay 1 state (input/output)
	* Relay 2 state (input/output)

# Example

```JavaScript
var tessel = require("tessel"), tr = require("tessel-reactive");
var climate = require("climate-si7020");
var ambient = require("ambient-attx4");

var climateModule = new tr.ClimateModule(climate.use(tessel.port.B),{name:"climateB", interval: 1000});

var ambientModule = new tr.AmbientModule(ambient.use(tessel.port.C),{name:"ambientA",interval: 1000});

var button = new tr.Button(new tr.DigitalPin(tessel.button),{name:"Button 2"});
var blueLED = new tr.DigitalPin(tessel.led[1]);

var aggregatedInputs = climateModule.input().merge(ambientModule.input());

aggregatedInputs.onValue(function(value)){
	console.log(value);
};

// subscribe the blue led pin to the output of the button.
// The led will respond to the boolean button states...
blueLED.output().plug(button.input());

```