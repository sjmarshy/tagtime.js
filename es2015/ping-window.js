import electron from "electron";
import { resolve } from "path";
import { storeTag, getLastTag } from "./storage.js";

const { BrowserWindow, ipcMain } = electron;

let controlWindow = null;

export default function main(time) {

    controlWindow = new BrowserWindow({
        width: 400,
        height: 400,
        title: "Tagtime.js | Ping",
        resizable: false });

    const lastTag = getLastTag();

    ipcMain.on("request:pingdata", function handleRequestPingdata(e) {

        e.sender.send("request:pingdata", {
            lastTag
        });
        ipcMain.removeListener("request:pingdata", handleRequestPingdata);
    });

    ipcMain.on("request:time", function handleRequestTime (e) {

        e.sender.send("request:time", time);
        ipcMain.removeListener("request:time", handleRequestTime);
    });

    ipcMain.on("tag:" + time.toString(), function handleTag(event, tag) {

        storeTag(time, tag);
        ipcMain.removeListener(`tag:${time.toString()}`, handleTag);
    });

    controlWindow.loadURL(`file://${resolve(__dirname, "..", "assets", "ping.html")}`);
}
