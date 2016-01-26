import electron from "electron";
import { resolve } from "path";
import { storeTag, getLastTag } from "./storage.js";
import moment from "moment";

const { BrowserWindow, ipcMain } = electron;

let controlWindow = null;

export default function main(time) {

    controlWindow = new BrowserWindow({
        width: 400,
        height: 400,
        title: "Tagtime.js | Ping",
        resizable: false });

    const lastTag = getLastTag();

    ipcMain.on("request:pingdata", e => {

        e.sender.send("request:pingdata", {
            lastTag,
            dateString: moment.unix(time).format("YYYY-MM-DD HH:mm:ss")
        });
    });

    ipcMain.on("request:time", e => {

        e.sender.send("request:time", time);
    });

    ipcMain.on("tag:" + time.toString(), function handleTag(event, tag) {

        storeTag(time, tag);
        ipcMain.removeListener(`tag:${time.toString()}`, handleTag);
    });

    controlWindow.loadURL(`file://${resolve(__dirname, "..", "assets", "ping.html")}`);
}
