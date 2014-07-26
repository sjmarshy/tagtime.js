// moment should help us with the time requirements
var moment = require('moment');
var fs     = require('fs');
var log    = require('npmlog');

var format = 'YYYY-MM-DD HH:mm:ss Z'

console = log

var now_s = moment().unix();
var now_str = moment.unix(now_s).format(format);

// we need a way to start with a seed, use each new interval as the next seed,
// and this way we should be able to deterministically work out any ping in the
// series. 

var getNextIntervalSeconds = function (frequency_m) {
    return -1 * Math.log(Math.random()) * (frequency_m * 60);
};

fs.readFile('./config/tagtime.json', function (error, buf) {
    var config, frequency_m;
    if (error) {
        console.error(error);
        process.exit(1);
    }
    config         = JSON.parse(buf.toString());
    frequency_m    = config.frequency;
    nextInterval_s = getNextIntervalSeconds(frequency_m);
    nextPing_s     = now_s + nextInterval_s;
    nextPing_str   = moment.unix(nextPing_s).format(format);

    console.log(moment.unix(nextPing_s).format());

    console.log('')
    console.info('now_str', now_str);
    console.info('difference: ', nextInterval_s);
    console.info('nextPing_str', nextPing_str);
    console.log('');
});


