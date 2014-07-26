(function() {
  var Pings, fs, moment;

  moment = require('moment');

  fs = require('fs');

  Pings = (function() {
    Pings.initial_seed = 1406331136;

    Pings.start_sec = moment().unix();

    Pings.format = 'YYYY-MM-DD HH:mm:ss Z';

    function Pings(frequency_min) {
      var m;
      m = require('mersenne').MersenneTwister19937;
      this.seed = Pings.initial_seed;
      this.rng = new m();
      this.frequency_sec = frequency_min * 60;
      this.seedRng();
    }

    Pings.prototype.seedRng = function() {
      return this.rng.init_genrand(this.seed);
    };

    Pings.prototype.random = function() {
      return this.rng.genrand_real2();
    };

    Pings.prototype.ping = function() {
      var log, rngNum;
      rngNum = this.random();
      log = Math.log(this.random());
      return -1 * this.frequency_sec * log;
    };

    Pings.prototype.pingBefore = function(time) {
      var lastPing, nextPing;
      this.seed = Pings.initial_seed;
      this.seedRng();
      nextPing = lastPing = this.seed;
      while (nextPing < time) {
        lastPing = nextPing;
        nextPing = this.nextPing(lastPing);
      }
      return lastPing;
    };

    Pings.prototype.nextPing = function(prevPing) {
      var interval;
      this.seed = prevPing;
      this.seedRng();
      interval = this.ping();
      return interval + prevPing;
    };

    return Pings;

  })();

  fs.readFile('./config/tagtime.json', function(error, buffer) {
    var config, lastPing, nextPing, now, pinger;
    if (error) {
      console.error(error);
      return process.exit(1);
    } else {
      config = JSON.parse(buffer.toString());
      pinger = new Pings(config.frequency);
      now = moment().unix();
      lastPing = pinger.pingBefore(now);
      nextPing = pinger.nextPing(lastPing);
      console.log('last ping was: ', moment.unix(lastPing).format(Pings.format));
      return console.log('next ping is:  ', moment.unix(nextPing).format(Pings.format));
    }
  });

}).call(this);
