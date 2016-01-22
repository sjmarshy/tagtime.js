"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = timer;

var _mersenne = require("mersenne");

function seed(rng, seed) {

    rng.init_genrand(seed);

    return rng;
}

function freshTwister(initialSeed) {

    var rng = new _mersenne.MersenneTwister19937();

    return seed(rng, initialSeed);
}

function twisterNumber(initialSeed) {
    var rng = arguments.length <= 1 || arguments[1] === undefined ? freshTwister(initialSeed) : arguments[1];

    return rng.genrand_real2();
}

function now() {
    return Date.now() / 1000;
}

function nextInterval(rng, initialSeed, freq) {

    return -1 * freq * Math.log(twisterNumber(initialSeed, rng));
}

function pingAfter(time, initialSeed, freq) {
    var rng = arguments.length <= 3 || arguments[3] === undefined ? freshTwister(initialSeed) : arguments[3];

    var nextState = seed(rng, time);
    var interval = nextInterval(nextState, initialSeed, freq);

    return interval + time;
}

function pingBefore(time, initialSeed, freq) {
    var rng = arguments.length <= 3 || arguments[3] === undefined ? freshTwister(initialSeed) : arguments[3];

    var nextPing = initialSeed;
    var lastPing = undefined;

    while (nextPing < time) {

        lastPing = nextPing;
        nextPing = pingAfter(lastPing, initialSeed, freq, rng);
    }

    return lastPing;
}

function startTimer(initialSeed, rng, freq, handler) {

    var n = now();
    var last = pingBefore(n, initialSeed, freq, rng);
    var next = pingAfter(last, initialSeed, freq, rng);

    return setInterval(function () {

        n = now();

        if (n > next) {

            last = next;
            next = pingAfter(last, initialSeed, freq, rng);

            handler(last);
        }
    }, 1000);
}

function timer(initialSeed, freq, handler) {

    var rng = freshTwister(initialSeed);
    var freqInMS = freq * 60;

    var stopID = startTimer(initialSeed, rng, freqInMS, handler);

    return function () {

        clearInterval(stopID);
    };
}
//# sourceMappingURL=timer.js.map