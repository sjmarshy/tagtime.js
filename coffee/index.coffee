fs      = require 'fs'
os      = require 'os'
path    = require 'path'
moment  = require 'moment'
Pings   = require './src/pings'
Logfile  = require './src/logfile'
{spawn} = require 'child_process'
_       = require 'underscore'

handleError = (error) ->
    console.error error
    process.exit 1

fs.readFile './config/tagtime.json', (error, buffer) ->
    if error
        handleError error
    else
        config = JSON.parse buffer.toString()

        pinger = new Pings config.frequency

        logfile = new Logfile './log.json'
        logfile.createLog()

        pinger.start()

        pinger.on 'ping', (now) ->
            tmpfile = path.join os.tmpdir(), "ping-#{now}"

            popular = logfile.getMostPopular()

            Logfile.touch tmpfile, (error) ->
                if error
                    handleError error
                else
                    tmpString = "\n# #{moment.unix(now).format('ddd HH:mm:ss')}\n"
                    tmpString += "# popular top-level tags:"
                    popularString = _(popular).reduce (mem, val, key) ->
                        if val > 5
                            return mem + "\n##{key}:"
                        else
                            return mem
                    , tmpString

                    Logfile.write tmpfile, popularString, ->
                        gvim = spawn 'gvim', ['-f', '--', tmpfile]

                        watcher = fs.watch tmpfile,  ->
                            fs.readFile tmpfile, (error, data) ->
                                if data
                                    data = data.toString()
                                    logfile.writeLog Logfile.stripComments(data), now

                        watcher.on 'change', ->
                            watcher.close()

                        gvim.on 'close', ->
                            fs.unlink tmpfile
