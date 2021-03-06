moment       = require 'moment'
EventEmitter = require('events').EventEmitter

# Pings will hold all the information surrounding the pinging, and
# will contain utility methods surrounding the ping times.

module.exports =
    class Pings extends EventEmitter
        @initial_seed:  1406331136
        @start_sec:     moment().unix()
        @format:        'YYYY-MM-DD HH:mm:ss Z'
        @getNow = ->
            return moment().unix()


        @logStats = (lastPing, nextPing, startSec) ->
            console.log('\n---PING!---\n')
            console.log('last ping was: ', moment.unix(lastPing).format(Pings.format))
            console.log('gap is: ', moment.duration(nextPing, 'seconds')
                .subtract(lastPing, 'seconds').humanize())
            console.log('next ping is:  ', moment.unix(nextPing).format(Pings.format))
            console.log('\nbeen running for: ', moment.duration(Pings.getNow(), 'seconds')
                .subtract(startSec, 'seconds').humanize(), '\n')
            console.log('-----------\n\n')


        constructor:(frequency_min) ->
            m = require('mersenne').MersenneTwister19937
            @seed          = Pings.initial_seed
            @rng           = new m()
            @frequency_sec = frequency_min * 60

            @seedRng()

        start: ->
            now = Pings.getNow()
            @lst = @pingBefore now
            @nxt = @nextPing @lst

            @log()

            setInterval =>
                now = Pings.getNow()
                if now > @nxt

                    @lst = @nxt
                    @nxt = @nextPing @lst

                    @emit('ping', @lst)

                    @log()
            , 1000

        seedRng: ->
            @rng.init_genrand @seed

        log: ->
            Pings.logStats @lst, @nxt, Pings.start_sec

        random: ->
            return @rng.genrand_real2()

        ping: ->
            rngNum = @random()
            log = Math.log(@random())
            return -1 * @frequency_sec * log

        pingBefore: (time) ->
            @seed = Pings.initial_seed
            @seedRng()

            nextPing = lastPing = @seed
            while nextPing < time
                lastPing = nextPing
                nextPing = @nextPing lastPing

            return lastPing

        nextPing: (prevPing) ->
            @seed = prevPing
            @seedRng()

            interval = @ping()

            return interval + prevPing


