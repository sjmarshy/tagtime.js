import config from "zero-env";
import moment from "moment";
import { join, resolve } from "path";
import { statSync, readdirSync, readFileSync, writeFileSync } from "fs";

const STORAGE_DIR = resolve(config.tagtime.storagedir || join(config.home, ".tagtime"));

function getFilename(time) {

    let m = moment.unix(time);

    return resolve(join(STORAGE_DIR, `${m.format("YYYY-MM-DD")}.json`));
}

function loadFileJson(filename) {

    return JSON.parse(readFileSync(filename, { encoding: "utf8" }));
}

function writeFileJson(filename, data) {

    return writeFileSync(filename, JSON.stringify(data));
}

export function storeTag(time, tag) {

    let fn = getFilename(time);
    let data;

    try {
        let stats = statSync(fn);

        if (stats.isFile()) {

            data = loadFileJson(fn);
        } else {

            data = {};
        }
    } catch (e) {

        data = {};
    } finally {

        data[time] = tag;
        writeFileJson(fn, data);
    }
}

export function getAllData() {

    let files = readdirSync(STORAGE_DIR);
    let ds = files.map(f => resolve(STORAGE_DIR, f)).map(loadFileJson);

    return ds.reduce((m, d) => {

        return Object.assign({}, m, d);
    }, {});
}

export function getLastTag() {


    try {

        let data = getAllData();
        let ks = Object.keys(data).sort();

        return data[ks.reverse()[0]];
    } catch (e) {

        return null;
    }
}

let storageDirStats;

try {

    storageDirStats = statSync(STORAGE_DIR);
} catch (e) {

    throw new Error(`${STORAGE_DIR} needs to be a directory`);
}

if (!storageDirStats.isDirectory()) {

    throw new Error(`${STORAGE_DIR} needs to be a directory`);
}
