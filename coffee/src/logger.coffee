fs = require 'fs'
_  = require 'underscore'

module.exports =
    class Logger
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
            fs.readFile fname, done

        @stripComments: (data) ->
            lines = data.split '\n'
            newdata = _(lines).reject (l) ->
                return l[0] == '#'

            return newdata.join(' ')

        constructor: (@logfile) ->
        writeLog: (data, now) ->
           Logger.read @logfile, (error, log) =>
                unless error
                    if data.length > 0
                        json = JSON.parse log.toString()
                    else
                        json = {}

                    json[now] = data

                    newLog = JSON.stringify json
                    Logger.write @logfile, newLog, (error) ->
                        if error
                            Logger.handleError error


                else
                    Logger.handleError error


        createLog: ->
            unless Logger.isFile @logfile
                Logger.touch @logfile, (error) ->
                    if error
                        Logger.handleError error


