import config from "zero-env";
import timer from "./timer.js";
import { app } from "electron";
import controlWindow from "./control-window.js";
import pingWindow from "./ping-window.js";

const SEED = config.tagtime.seed;
const FREQ = config.tagtime.frequency;

function main() {

    timer(SEED, FREQ, time => {

        pingWindow(time);
    });

    app.on("ready", () => {

        controlWindow();
    });
}

main();
