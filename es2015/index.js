import config from "zero-env";
import timer from "./timer.js";

function main() {

    timer(config.tagtime.seed, config.tagtime.frequency, time =>  console.log(time));
}

main();
