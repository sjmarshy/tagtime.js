fs      = require 'fs'
os      = require 'os'
path    = require 'path'
Pings   = require './src/pings'
{spawn} = require 'child_process'

touch = (filename, done) ->
    fs.open filename, 'w', (error, fd) ->
        if error
            done new Error('unable to create tmpfile')
        else
            fs.close fd, done

isFile = (name) ->
    return fs.existsSync name

write = (name, data, done) ->
    fs.writeFile name, data, (error) ->
        if error
            done error
        else
            done()


fs.readFile './config/tagtime.json', (error, buffer) ->
    if error
        console.error error
        process.exit 1
    else
        config = JSON.parse buffer.toString()
        pinger = new Pings(config.frequency)

        pinger.start()

        pinger.on 'ping', (now) ->
            tmpfile = path.join os.tmpdir(), "ping-#{now}"

            touch tmpfile, (error) ->
                if error
                    console.error error
                    return process.exit 1
                else
                    gvim = spawn 'gvim', ['-f', '--', tmpfile]

                    gvim.on 'close', ->
                        fs.readFile tmpfile, (error, data) ->
                            log = './log.json'

                            delTmpfile = ->
                                fs.unlink tmpfile

                            writeLog = ->
                                fs.readFile log, (error, logdata) ->
                                    unless error
                                        if logdata.length > 0
                                            logJSON = JSON.parse logdata.toString()
                                        else
                                            logJSON = {}
                                        logJSON[now] = data.toString()
                                        newData = JSON.stringify(logJSON)
                                        write log, newData, ->
                                            delTmpfile()

                            if isFile log
                                writeLog()
                            else
                                touch log, ->
                                    writeLog()

