moment = require 'moment'
fs     = require 'fs'


# Pings will hold all the information surrounding the pinging, and
# will contain utility methods surrounding the ping times.
class Pings
    @initial_seed:  1406331136
    @start_sec:     moment().unix()
    @format:        'YYYY-MM-DD HH:mm:ss Z'

    constructor:(frequency_min) ->
        @seed          = Pings.initial_seed
        @rng           = require 'mersenne'
        @frequency_sec = frequency_min * 60

        @seedRng()

    seedRng: ->
        @rng.seed @seed

    random: ->
        return @rng.rand(1)
    
    ping: ->
        return -1 * @frequency_sec * Math.log(@random())

    pingBefore: (time) ->
        @seed = Pings.initial_seed
        @seedRng()

        nextPing = lastPing = @seed
        while nextPing < time
            lastPing = nextPing
            @nextPing nextPing

        return lastPing

    nextPing: (prevPing) ->
        @seed = prevPing
        @seedRng()

        return @ping() + prevPing


fs.readFile './config/tagtime.json', (error, buffer) ->
    if error
        console.error error
        process.exit 1
    else
        config = JSON.parse buffer.toString()
        pinger = new Pings(config.frequency)

        console.log('last ping was: ', pinger.pingBefore(moment.unix())


