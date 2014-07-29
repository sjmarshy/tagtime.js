(function() {
  var EventEmitter, Pings, moment,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  moment = require('moment');

  EventEmitter = require('events').EventEmitter;

  module.exports = Pings = (function(_super) {
    __extends(Pings, _super);

    Pings.initial_seed = 1406331136;

    Pings.start_sec = moment().unix();

    Pings.format = 'YYYY-MM-DD HH:mm:ss Z';

    Pings.getNow = function() {
      return moment().unix();
    };

    Pings.logStats = function(lastPing, nextPing, startSec) {
      console.log('\n---PING!---\n');
      console.log('last ping was: ', moment.unix(lastPing).format(Pings.format));
      console.log('gap is: ', moment.duration(nextPing, 'seconds').subtract(lastPing, 'seconds').humanize());
      console.log('next ping is:  ', moment.unix(nextPing).format(Pings.format));
      console.log('\nbeen running for: ', moment.duration(Pings.getNow(), 'seconds').subtract(startSec, 'seconds').humanize(), '\n');
      return console.log('-----------\n\n');
    };

    function Pings(frequency_min) {
      var m;
      m = require('mersenne').MersenneTwister19937;
      this.seed = Pings.initial_seed;
      this.rng = new m();
      this.frequency_sec = frequency_min * 60;
      this.seedRng();
    }

    Pings.prototype.start = function() {
      var now;
      now = Pings.getNow();
      this.lst = this.pingBefore(now);
      this.nxt = this.nextPing(this.lst);
      this.log();
      return setInterval((function(_this) {
        return function() {
          now = Pings.getNow();
          if (now > _this.nxt) {
            _this.lst = _this.nxt;
            _this.nxt = _this.nextPing(_this.lst);
            _this.emit('ping', _this.lst);
            return _this.log();
          }
        };
      })(this), 1000);
    };

    Pings.prototype.seedRng = function() {
      return this.rng.init_genrand(this.seed);
    };

    Pings.prototype.log = function() {
      return Pings.logStats(this.lst, this.nxt, Pings.start_sec);
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

  })(EventEmitter);

}).call(this);
