import electron from "electron";
import { resolve } from "path";
import { storeTag } from "./storage.js";

const { BrowserWindow, ipcMain } = electron;

let controlWindow = null;

export default function main(time) {

    controlWindow = new BrowserWindow({
        width: 400,
        height: 400,
        title: "Tagtime.js | Ping",
        resizable: false });

    ipcMain.on("request:time", e => {

        e.sender.send("request:time", time);
    });

    ipcMain.on("tag:" + time.toString(), function handleTag(event, tag) {

        storeTag(time, tag);
        ipcMain.removeListener(`tag:${time.toString()}`, handleTag);
    });

    controlWindow.loadURL(`file://${resolve(__dirname, "..", "assets", "ping.html")}`);
}
