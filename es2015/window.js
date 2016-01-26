import { BrowserWindow } from "electron";

let count = 0;

/*
 *
 * provide an abstraction over opening a generic window and droping some
 * knowledge on it.
 *
 * I'll also provide each window with a unique ID, which can be used to
 * communicate with each window individually later if required.
 *
 * this would be achieved by using the ID as a send/recieve channel on both
 * ends.
 */
export default function createWindow(windowOptions, initialData) {

    count++;

    if (!initialData.hasOwnProperty("id")) {

        initialData.id = count;
    }

    const window = new BrowserWindow(windowOptions);
    const webContents = window.webContents;

    webContents.on("did-finish-load", () => webContents.send("hydrate", initialData));

    return {

        window,
        id: initialData.id
    };
}
