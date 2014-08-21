
# Introduction

Tessel reactive is a functional reactive programming library that uses BaconJS in order to expose streams for Tessel modules, buttons, pins, …

It allows you to quickly develop for a Tessel.io board in a functional/baconJS style.

# Examples

## Create a stream for a digital pin:
```javascript
var
	tessel = require(“tessel”),
	tr = require(“tessel-reactive”);

var digitalPin = tr.digitalPin(tessel.ports.GPIO.digital[0]);

digitalPin.onValue(function(event){
	console.log(“Digital pin value:”+value.value);
};
```

## Create a new stream for a motion sensor.
var motion = Bacon.map(function(digitalValue){
	return {
		tr.value(digitalValue.value === 1 ? true, false,"motion");
	};
});