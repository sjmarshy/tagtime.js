fs      = require 'fs'
os      = require 'os'
path    = require 'path'
moment  = require 'moment'
Pings   = require './src/pings'
{spawn} = require 'child_process'
_       = require 'underscore'

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
                    write tmpfile, "##{moment.unix(now).format('ddd HH:mm:ss')}\n", ->
                        gvim = spawn 'gvim', ['-f', '--', tmpfile]

                        fs.watch tmpfile,  ->
                            fs.readFile tmpfile, (error, data) ->
                                stripComments = (data) ->
                                    if data
                                        strdata = data.toString()
                                        lines   = strdata.split '\n'
                                        newdata = _(lines).reject (l) ->
                                            return l[0] == '#'
                                        return newdata.join()
                                    else
                                        return ''

                                log = './log.json'
                                writeLog = (data) ->
                                    fs.readFile log, (error, logdata) ->
                                        unless error
                                            if logdata.length > 0
                                                logJSON = JSON.parse logdata.toString()
                                            else
                                                logJSON = {}
                                            logJSON[now] = data.toString()
                                            newData = JSON.stringify(logJSON)
                                            write log, newData, ->

                                if isFile log
                                    nData = stripComments data
                                    writeLog nData
                                else
                                    touch log, ->
                                        nData = stripComments data
                                        writeLog nData

                        gvim.on 'close', ->
                            fs.unlink tmpfile
