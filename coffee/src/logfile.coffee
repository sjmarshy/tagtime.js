fs             = require 'fs'
_              = require 'underscore'
{EventEmitter} = require 'events'

module.exports =
    class Logfile extends EventEmitter
        @handleError: (error) ->
            console.error error
            process.exit 1
        @touch: (fname, done) ->
            fs.open fname, 'w', (error, fd) ->
                if error
                    done new Error('unable to create tmpfile')
                else
                    fs.close fd, done

        @isFile: (fname) ->
            return fs.existsSync fname

        @write: (fname, data, done) ->
            fs.writeFile fname, data, (error) ->
                if error
                    done error
                else
                    done()

        @read: (fname, done) ->
            fs.readFile fname, (error, data) ->
                unless error
                    if data.length > 0
                        done JSON.parse data.toString()
                    else
                        done {}
                else
                    Logfile.handleError error

        @stripComments: (data) ->
            lines = data.split '\n'
            newdata = _(lines).reject (l) ->
                return l[0] == '#'

            return newdata.join(' ')

        constructor: (@logfile) ->
            Logfile.read @logfile, (log) =>
                @data = log
                @emit 'read', log

        writeLog: (data, now) ->
            @emit 'ping', now, data
            Logfile.read @logfile, (log) =>
                log[now] = data

                newLog = JSON.stringify log
                Logfile.write @logfile, newLog, (error) ->
                    if error
                        Logfile.handleError error
        createLog: ->
            unless Logfile.isFile @logfile
                Logfile.touch @logfile, (error) ->
                    if error
                        Logfile.handleError error


