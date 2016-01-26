var remote = require("electron").remote;

var curry = remote.require("ramda").curry;

module.exports = function makeIPCDriver(ipc) {

    return function (outgoing$) {

        return outgoing$.subscribe(function (outgoing) {

            let channel = outgoing.channel;
            let args = [ channel ];

            outgoing.args.map(args.push);

            ipc.send.apply(ipc, args);

            return curry(ipc.on(channel));
        });
    };
};
