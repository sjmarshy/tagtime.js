"use strict";

var _zeroEnv = require("zero-env");

var _zeroEnv2 = _interopRequireDefault(_zeroEnv);

var _timer = require("./timer.js");

var _timer2 = _interopRequireDefault(_timer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function main() {

    (0, _timer2.default)(_zeroEnv2.default.tagtime.seed, _zeroEnv2.default.tagtime.frequency, function (time) {
        return console.log(time);
    });
}

main();
//# sourceMappingURL=index.js.map