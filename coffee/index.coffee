moment = require 'moment'
fs     = require 'fs'


# Pings will hold all the information surrounding the pinging, and
# will contain utility methods surrounding the ping times.
class Pings
    @initial_seed:  1406331136
    @start_sec:     moment().unix()
    @format:        'YYYY-MM-DD HH:mm:ss Z'

    constructor:(frequency_min) ->
        m = require('mersenne').MersenneTwister19937
        @seed          = Pings.initial_seed
        @rng           = new m()
        @frequency_sec = frequency_min * 60

        @seedRng()

    seedRng: ->
        @rng.init_genrand @seed

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



fs.readFile './config/tagtime.json', (error, buffer) ->
    if error
        console.error error
        process.exit 1
    else
        config = JSON.parse buffer.toString()
        pinger = new Pings(config.frequency)

        now = moment().unix()
        lastPing = pinger.pingBefore now
        nextPing = pinger.nextPing lastPing

        console.log('last ping was: ', moment.unix(lastPing).format(Pings.format))
        console.log('next ping is:  ', moment.unix(nextPing).format(Pings.format))


