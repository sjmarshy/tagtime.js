Tag = require './tag'
_   = require 'underscore'

module.exports =
    class Record
        @parseTags: (tags) ->
            clean_tags = tags.trim()

            unless clean_tags
                return null

            tags_a = clean_tags.split ','

            tags_a_i = _(tags_a).map (t) ->
                t = t.trim()
                unless t.indexOf(':') == -1
                    heirarchy_a = t.split ':'

                    tag_h_a = _(heirarchy_a).reduce (memo, value, n, a) ->
                        getDeepestChild = (tag) ->
                            if tag.children &&
                            tag.children[0] &&
                            tag.children[0].children
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
        getTags: ->
            _.chain(@tags).map (t) ->
                return t.getHeirsNames()
            .flatten().value()


