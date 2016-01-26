import config from "zero-env";
import timer from "./timer.js";
import { app } from "electron";
import controlWindow from ".windows/control-window.js";
import pingWindow from ".windows/ping-window.js";
import { statString } from "./stats.js";

const SEED = config.tagtime.seed;
const FREQ = config.tagtime.frequency;
const DEBUG = config.tagtime.debug;

function main() {

    timer(SEED, FREQ, time => {

        pingWindow(time);

        if (DEBUG) {

            console.log(statString());
        }
    });

    app.on("ready", () => {

        controlWindow();
    });
}

main();
