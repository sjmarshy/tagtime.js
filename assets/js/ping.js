var ipcRenderer = require("electron").ipcRenderer;
var remote = require("electron").remote;
var makeIPCDriver = require("./drivers/ipc.js");

var cycleCore = remote.require("@cycle/core");
var cycleDom = remote.require("@cycle/dom");
var Rx = remote.require("rx");

function submitTag(time, tag) {

    ipcRenderer.send("tag:" + time.toString(), tag.toString());
}

ipcRenderer.on("request:time", function (e, time) {
    window.time = time;
});

ipcRenderer.on("request:pingdata", function (e, data) {

    window.pingdata = data;

    var tag = document.querySelector(".last-tag .tag");
    var time = document.querySelector(".title.-time");

    time.innerHTML = data.dateString;

    tag.innerHTML = data.lastTag;
    tag.addEventListener("click", function () {

        submitTag(time, data.lastTag);
        window.close();
    });
});

ipcRenderer.send("request:time");
ipcRenderer.send("request:pingdata");

window.document.querySelector("a.submit")
.addEventListener("click", function () {

    var tag = window.document.querySelector("input[name=tag]").value;

    if (tag.length > 0) {

        submitTag(window.time, tag);
        window.close();
    }
});

function intents(sources) {

    return {

        lastTag: sources.ipcPingdata.map(function (ev, data) { return data.lastTag; }),
        dateString: sources.ipcPingdata.map(function (ev, data) { return data.dateString; })
    };
}

function main(sources) {

    sources.ipcTime.do((ev, time) => {

        if (time) {

            window.time = time;
        }
    });

    var actions = intents(sources);
    var model$ = model(actions);
    var v = view(model$);

    return {

        ipcTime: Rx.Observable.just({ args: [] }),
        ipcPingdata: Rx.Observable.just({ args: [] }),
        dom: v
    };
}

var drivers = {

    ipcTime: makeIPCDriver(ipcRenderer, "request:time"),
    ipcPingdata: makeIPCDriver(ipcRenderer, "request:pingdata"),
    ipcSubmitTag: makeIPCDriver(ipcRenderer, "tag:" + window.time.toString()),
    dom: cycleDom.makeDOMDriver("#ping-app")
};

cycleCore.run(main, drivers);
