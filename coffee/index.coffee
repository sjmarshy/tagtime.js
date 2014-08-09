Hapi    = require 'hapi'
q       = require 'q'
fs      = require 'fs'
os      = require 'os'
path    = require 'path'
moment  = require 'moment'
Pings   = require './src/pings'
Logfile = require './src/logfile'
{spawn} = require 'child_process'
_       = require 'underscore'

server = new Hapi.Server 3891

getConfig = (fname) ->
    d = q.defer();

    fs.readFile fname, (error, buffer) ->
        if error
            d.reject error
        else
            d.resolve JSON.parse buffer.toString()

    return d.promise


handleError = (error) ->
    console.error error
    process.exit 1


getPopularBreakdown = (popular) ->
    breakdown = "# Popular top-level tags"
    return _(popular).reduce (memo, value, key) ->
        if value > 5
            return memo + "\n#    #{key}"
        else
            return memo
    , breakdown

getAllPopularString = (log) ->
    counts = log.getMostPopular()
    string = "# all popular tags"
    return _(counts).reduce (memo, value, key) ->
        if value > 5
            return memo + "\n#    #{key}(#{value})"
        else
            return memo
    , string


api = (server, logfile, pinger) ->
    getLast = (req, res) ->
        res pinger.lst

    # /tags/
    server.route [
        {
            method: 'GET'
            path: '/api/tags/popularity'
            handler: (req, res) ->
                res logfile.getMostPopular()
        }
        {
            method: 'GET'
            path: '/api/tags'
            handler: (req, res) ->
                res logfile.getTagsAsTree()
        }
        {
            method: 'GET'
            path: '/api/tags/flat'
            handler: (req, res) ->
                res logfile.getTagsAsUniqueList()
        }
        {
            method: 'GET'
            path: '/api/tags/flat/raw'
            handler: (req, res) ->
                res logfile.getTagsAsList()
        }
        {
            method: 'GET'
            path: '/api/tags/detail'
            handler: (req, res) ->
                res logfile.getTagsAsDetailTree()
        }
    ]

    # /time/
    server.route [
        {
            method: 'GET'
            path: '/api/time/prev'
            handler: getLast
        }
        {
            method: 'GET'
            path: '/api/time/last'
            handler: getLast
        }
        {
            method: 'GET'
            path: '/api/time/next'
            handler: (req, res) ->
                res pinger.nxt
        }
    ]


    server.start()

getConfig './config/tagtime.json'
.then (config) ->
    pinger = new Pings config.frequency

    logfile = new Logfile './log.json'
    logfile.createLog()

    api server, logfile, pinger

    pinger.start()
    pinger.on 'ping', (now) ->
        tmpfile = path.join os.tmpdir(), "ping-#{now}"
        popular = logfile.getMostPopularTopLevel()

        Logfile.touch tmpfile, (error) ->
            if error
                handleError error
            else
                tmpString  = "\n# #{moment.unix(now).format('ddd HH:mm:ss')}\n"
                tmpString += getPopularBreakdown popular
                tmpString += getAllPopularString(logfile)

                Logfile.write tmpfile, tmpString, ->
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
.catch handleError
