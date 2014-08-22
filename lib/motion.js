/**
 * Created by daankets on 22/08/14.
 */

(function motionModule() {
	"use strict";

	var common = require("./common");

	var MotionModule = function (digitalPin, options) {
		this._options = options || {};
		this._options.motionState = this._options.motionState || true;
		this._pin = digitalPin;
	};

	MotionModule.prototype.input = function () {
		var self = this;
		if (!this._input) {
			this._input = this.input = common.eventStream(this._pin.input(), {source: this._options.name}, function (value, event) {
				event.state = (value === self._options.motionState) ? "motion" : "no motion";
			}, true);
		}
		return this._input;
	};

	module.exports = {
		MotionModule: MotionModule
	};

}());