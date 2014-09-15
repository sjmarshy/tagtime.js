Hapi    = require 'hapi'
Pings   = require './src/pings'
Logfile = require './src/logfile'
Tags    = require './src/tags'
q       = require 'q'
fs      = require 'fs'
os      = require 'os'
path    = require 'path'
moment  = require 'moment'
{spawn} = require 'child_process'
_       = require 'underscore'
api     = require './src/api'

server = new Hapi.Server 3891

getConfig = (fname) ->
    d = q.defer()

    fs.readFile fname, (error, buffer) ->
        if error
            d.reject error
        else
            d.resolve JSON.parse buffer.toString()

    return d.promise


handleError = (error) ->
    console.error error
    process.exit 1

getConfig './config/tagtime.json'
.then (config) ->
    # Pings controls the frequency of pings / time based stuff
    pinger = new Pings config.frequency

    # Logfile reads from / writes to the log file
    logfile = new Logfile './log.json'
    logfile.createLog()

    # tags keeps track of all the individual records and tags and provides
    # ways of manipulating them
    tags = new Tags logfile

    # api provides a HTTP interface to grab all this stuff
    api server, tags, pinger, config

    pinger.start()
    pinger.on 'ping', (now) ->
        tmpfile = path.join os.tmpdir(), "ping-#{now}"

        Logfile.touch tmpfile, (error) ->
            if error
                handleError error
            else
                tmpString  = "\n# #{moment.unix(now).format('ddd HH:mm:ss')}\n"

                Logfile.write tmpfile, tmpString, ->
                    gvim = spawn 'gvim', ['-f', '--', tmpfile]

                    watcher = fs.watch tmpfile,  ->
                        fs.readFile tmpfile, (error, data) ->
                            if data
                                data = data.toString()
                                logfile.writeLog Logfile.stripComments(data),
                                    now

                    watcher.on 'change', ->
                        watcher.close()

                    gvim.on 'close', ->
                        fs.unlink tmpfile
.catch handleError
