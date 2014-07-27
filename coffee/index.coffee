fs     = require 'fs'
Pings  = require './src/pings'

fs.readFile './config/tagtime.json', (error, buffer) ->
    if error
        console.error error
        process.exit 1
    else
        config = JSON.parse buffer.toString()
        pinger = new Pings(config.frequency)

        pinger.start()
