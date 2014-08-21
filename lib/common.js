/**
 * Created by daankets on 21/08/14.
 */
(function moduleName() {
	"use strict";

	var event = function (value, extend) {
		var e = {};
		//Object.create(extend||{});
		//e.prototype = extend || e.prototype;
		if (extend && extend instanceof Object) {
			Object.keys(extend).forEach(function (propertyName) {
				e[propertyName] = extend[propertyName];
			});
		}
		e.value = value;
		e.time = e.time || new Date().getTime();
		return e;
	};

	var eventStream = function (sourceStream, extend, transformer) {
		return sourceStream.map(function (value) {
			var e = null;
			if (value && value.hasOwnProperty("value")) {
				e = event(value.value, extend);
			} else {
				e = event(value, extend);
			}
			if (transformer && typeof transformer === "function") {
				e.value = transformer(e.value, e) || e.value;
			}
			return e;
		});
	};

	module.exports = {
		event: event,
		eventStream: eventStream
	};

}());
