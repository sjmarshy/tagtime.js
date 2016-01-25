/*
 * collect and provide stats, both directly related and meta.
 *
 * for debugging and fun.
 */

import { getAllData } from "./storage.js";
import { slice } from "ramda";

function sum(a, b) { return a + b; }
function numericSort(a, b) { return a - b; }

function differences(a, i, arr) {

    if (i + 1 !== arr.length) {

        const b = arr[i + 1];

        return a - b;
    } else {

        return null;
    }
}

// return the average time between pings in seconds.
export function averageTimeBetweenPings() {

    const d = getAllData();
    const ks = Object.keys(d);

    return slice(0, -1, ks.map(parseFloat).sort(numericSort).reverse().map(differences)).reduce(sum) / ks.length;
}

export function statString() {

    return `average time between pings: ${averageTimeBetweenPings()} seconds`;
}
