import electron from "electron";
import { resolve } from "path";

const { BrowserWindow } = electron;

let controlWindow = null;

export default function main() {

    controlWindow = new BrowserWindow({ width: 200, height: 60, title: "Tagtime.js | Control", resizable: false});
    controlWindow.loadURL(`file://${resolve(__dirname, "..", "assets", "control.html")}`);
}
