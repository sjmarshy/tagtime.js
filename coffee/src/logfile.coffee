fs = require 'fs'
q  = require 'q'
_  = require 'underscore'

class Tag
    @makeChild: (parent, child) ->
        parent.children = [];
        parent.children.push child

    constructor: (@name, @children) ->
    getChild: (name) ->
        return _(@children).map (c) ->
            if c.name == name
                return c
            else
                return c.getChild name

class Record
    @parseTags: (tags) ->
        # this...requires work
        clean_tags = tags.trim()

        unless clean_tags
            return null

        tags_a = clean_tags.split ','

        tags_a_i = _(tags_a).map (t) ->
            unless t.indexOf(':') == -1
                heirarchy_a = t.split ':'

                tag_h_a = _(heirarchy_a).reduce (memo, value, n, a) ->
                    getDeepestChild = (tag) ->
                        if tag.children[0].children
                            return getDeepestChild tag.children[0]
                        else
                            return tag.children[0] || tag

                    unless memo.children
                        p = new Tag memo
                        c = new Tag value
                        p.children = [c]

                        return p
                    else
                        t = getDeepestChild memo
                        t.children = [new Tag value]
                        return memo

                return tag_h_a
            else
                return new Tag t

        return tags_a_i

    constructor: (@time, tags) ->
        @tags = Record.parseTags tags
    getTopLevelTags: ->
        return _(@tags).map (t) ->
            return t.name

module.exports =
    class Logfile
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
            @buildRecords()

        buildRecords: ->
            Logfile.read @logfile, (log) =>
                @records = _(log).map (tags, time) ->
                    return new Record time, tags

        writeLog: (data, now) ->
           Logfile.read @logfile, (log) =>
                log[now] = data

                newLog = JSON.stringify log
                Logfile.write @logfile, newLog, (error) =>
                    if error
                        Logfile.handleError error
                    else
                        @buildRecords()
        getTagsAsTree: ->
            tagTree = {}

            walk = (tag, tree) ->
                n = tag.name

                unless tree[n]
                    tree[n] = {}

                t = tree[n]

                if tag.children && tag.children.length > 0
                    _(tag.children).each (child) ->
                        walk child, t
                else
                    t = null

            _(@records).each (r) ->
                if r.tags && r.tags.length > 0
                    _(r.tags).forEach (tag) ->
                        walk tag, tagTree

            return tagTree

        getTagsAsList: ->
            tags = @getTagsAsTree()
            keys = []

            getKeys = (tags) ->
                keys.push _(tags).keys()

                _(keys).each (k) ->
                    if tags[k]
                        getKeys tags[k]

            getKeys tags

            return _(keys).flatten()

        getMostPopular: ->
            tags  = @getTagsAsList()
            cache = {}

            _(tags).each (tag) ->
                unless cache[tag]
                    cache[tag] = 1
                else
                    cache[tag]++

            return cache


        getMostPopularTopLevel: ->
            count = {}

            tags = _(@records).map (r) ->
                return r.getTopLevelTags()

            sorted = _.chain(tags).flatten().sortBy (t) ->
                return t
            .map (t) ->
                return t.trim()
            .value()

            _(sorted).each (t) ->
                if count[t]
                    count[t]++
                else
                    count[t] = 1

            return count


        createLog: ->
            unless Logfile.isFile @logfile
                Logfile.touch @logfile, (error) ->
                    if error
                        Logfile.handleError error


