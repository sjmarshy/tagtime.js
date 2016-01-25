var remote = require("electron").remote;

var Rx = remote.require("rx");
var curry = remote.require("ramda").curry;

module.exports = function makeIPCDriver(ipc, channel) {

    return function (outgoing$) {

        outgoing$.subscribe(function (outgoing) {

            let args = [ channel ];

            outgoing.args.map(args.push);

            ipc.send.apply(ipc, args);
        });

        return Rx.Observable.fromCallback(curry(ipc.on(channel)))();
    };
};
