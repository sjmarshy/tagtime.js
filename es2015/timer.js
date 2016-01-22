import { MersenneTwister19937 } from "mersenne";

function seed(rng, seed) {

    rng.init_genrand(seed);

    return rng;
}

function freshTwister(initialSeed) {

    const rng = new MersenneTwister19937();

    return seed(rng, initialSeed);
}

function twisterNumber(initialSeed, rng = freshTwister(initialSeed)) {

    return rng.genrand_real2();
}

function now() { return Date.now() / 1000; }

function nextInterval(rng, initialSeed, freq) {

    return -1 * freq * Math.log(twisterNumber(initialSeed, rng));
}

function pingAfter(time, initialSeed, freq, rng = freshTwister(initialSeed)) {

    let nextState = seed(rng, time);
    let interval = nextInterval(nextState, initialSeed, freq);

    return interval + time;
}

function pingBefore(time, initialSeed, freq, rng = freshTwister(initialSeed)) {

    let nextPing = initialSeed;
    let lastPing;

    while (nextPing < time) {

        lastPing = nextPing;
        nextPing = pingAfter(lastPing, initialSeed, freq, rng);
    }

    return lastPing;
}

function startTimer(initialSeed, rng, freq, handler) {

    let n = now();
    let last = pingBefore(n, initialSeed, freq, rng);
    let next = pingAfter(last, initialSeed, freq, rng);

    return setInterval(() => {

        n = now();

        if (n > next) {

            last = next;
            next = pingAfter(last, initialSeed, freq, rng);

            handler(last);
        }
    },1000);
}

export default function timer(initialSeed, freq, handler) {

    const rng = freshTwister(initialSeed);
    const freqInMS = freq * 60;

    let stopID = startTimer(initialSeed, rng, freqInMS, handler);

    return () => {

        clearInterval(stopID);
    };
}
