"use strict";

var _zeroEnv = require("zero-env");

var _zeroEnv2 = _interopRequireDefault(_zeroEnv);

var _timer = require("./timer.js");

var _timer2 = _interopRequireDefault(_timer);

var _electron = require("electron");

var _controlWindow = require("./control-window.js");

var _controlWindow2 = _interopRequireDefault(_controlWindow);

var _pingWindow = require("./ping-window.js");

var _pingWindow2 = _interopRequireDefault(_pingWindow);

var _stats = require("./stats.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SEED = _zeroEnv2.default.tagtime.seed;
var FREQ = _zeroEnv2.default.tagtime.frequency;
var DEBUG = _zeroEnv2.default.tagtime.debug;

function main() {

    (0, _timer2.default)(SEED, FREQ, function (time) {

        (0, _pingWindow2.default)(time);

        if (DEBUG) {

            console.log((0, _stats.statString)());
        }
    });

    _electron.app.on("ready", function () {

        (0, _controlWindow2.default)();
    });
}

main();
//# sourceMappingURL=index.js.map