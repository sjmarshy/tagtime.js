import electron from "electron";
import { resolve } from "path";
import { storeTag, getLastTag } from "../storage.js";
import createWindow from "../window.js";
import moment from "moment";

const { ipcMain } = electron;


export default function main(time) {

    let controlWindow = createWindow({
        title: "Tagtime.js | Ping" },

        { time: time,

            id: time.toString(),

            lastTag: getLastTag(),

            dateString: moment.unix(time).format("YYYY-MM-DD HH:mm:ss") }).window;


    ipcMain.on("tag:" + time.toString(), function handleTag(event, tag) {

        storeTag(time, tag);
        ipcMain.removeListener(`tag:${time.toString()}`, handleTag);
        controlWindow.close();
    });

    controlWindow.loadURL(`file://${resolve(__dirname, "..", "..", "assets", "ping.html")}`);
}
