var ipcRenderer = require("electron").ipcRenderer;
var remote = require("electron").remote;
var makeIPCDriver = require("./drivers/ipc.js");

var cycleCore = remote.require("@cycle/core");
var cycleDom = remote.require("@cycle/dom");
var Rx = remote.require("rx");

var div = cycleDom.div;
var h1 = cycleDom.h1;
var h2 = cycleDom.h2;
var p = cycleDom.p;
var input = cycleDom.input;
var a = cycleDom.a;

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

        setLastTag$: sources.ipc.filter(hasProperty("channel", "lastTag")).map(function (ev, data) { return data.lastTag; }),
        setDateString$: sources.ipc.filter(hasProperty("channel", "dateString")).map(function (ev, data) { return data.dateString; }),
        setTimeOfPing$: sources.ipc.filter(hasProperty("channel", "timeOfPing")).map(),
        submitLastTag$: sources.dom.select(".last-tag .tag").events("click"),
        submitCurrentInput$: sources.dom.select("a.submit").events("click"),
        updateCurrentInput$: sources.dom.select("input").events("change").map(function (e) { return e.target.value; })
    };
}

function model(actions) {

    return Rx.Observable.combineLatest(

            actions.lastTag$.startWith(""),

            actions.dateString$.startWith(""),

            actions.updateCurrentInput$.startWith(""),

            function (lastTag, dateString, currentInput) {

                let state = {
                    lastTag: lastTag,
                    dateString: dateString,
                    currentInput: currentInput
                };

                return state;
            });
}

function view(state$) {

    return state$.map(function (state) {

        return div([

            h1({ class: "title -time" }, state.dateString),
            h2("What are you doing right now?"),

            div({ class: "last-tag" }, [

                p("last time:"),
                p({ class: "tag" }, state.lastTag)
            ]),

            input({ type: "text", name: "tag" }),
            a({ class: "submit", href: "#" }, "Submit" )
        ]);
    });
}

function main(sources) {

    var actions = intents(sources);
    var state$ = model(actions);
    var v = view(state$);

    return {

        dom: v
    };
}

var drivers = {
    dom: cycleDom.makeDOMDriver("#ping-app"),
    ipc: makeIPCDriver(ipcRenderer)
};

cycleCore.run(main, drivers);
