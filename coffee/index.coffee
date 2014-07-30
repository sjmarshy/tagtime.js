fs      = require 'fs'
os      = require 'os'
path    = require 'path'
moment  = require 'moment'
Pings   = require './src/pings'
Logger  = require './src/logger'
{spawn} = require 'child_process'
_       = require 'underscore'

fs.readFile './config/tagtime.json', (error, buffer) ->
    if error
        console.error error
        process.exit 1
    else
        config = JSON.parse buffer.toString()
        pinger = new Pings config.frequency
        logger = new Logger './log.json'
        logger.createLog()


        pinger.start()

        pinger.on 'ping', (now) ->
            tmpfile = path.join os.tmpdir(), "ping-#{now}"

            popular = logger.getMostPopular()

            Logger.touch tmpfile, (error) ->
                if error
                    console.error error
                    return process.exit 1
                else
                    tmpString = "\n# #{moment.unix(now).format('ddd HH:mm:ss')}\n"
                    popularString = _(popular).reduce (mem, val, key) ->
                        if val > 5
                            return mem + "\n##{key}:"
                        else
                            return mem
                    , tmpString
                    
                    Logger.write tmpfile, popularString, ->
                        gvim = spawn 'gvim', ['-f', '--', tmpfile]

                        watcher = fs.watch tmpfile,  ->
                            fs.readFile tmpfile, (error, data) ->
                                if data
                                    data = data.toString()
                                    logger.writeLog Logger.stripComments(data), now

                        watcher.on 'change', ->
                            watcher.close()

                        gvim.on 'close', ->
                            fs.unlink tmpfile
