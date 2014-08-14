_  = require 'underscore'

module.exports =
    class Tag
        @makeChild: (parent, child) ->
            parent.children = []
            parent.children.push child

        constructor: (@name, @children) ->
            unless @children
                @children = []

        getChild: (name) ->
            return _(@children).map (c) ->
                if c.name == name
                    return c
                else
                    return c.getChild name

        getDirectHeirs: ->
            return @children

        getDirectHeirsNames: ->
            _(@children).map (c) ->
                return c.name

        getHeirs: ->
            heirs = []

            walk = (tag) ->
                heirs.push tag
                _(tag.getDirectHeirs()).each (c) ->
                    walk (c)

            _(@children).each (c) ->
                walk c

            return _(heirs).flatten()

        getHeirsNames: ->
            _(@getHeirs()).map (p) ->
                return p.name


