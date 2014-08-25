var d3 = require('../bc/d3/d3.js');
var $  = require('../bc/jquery/dist/jquery.js');
var _  = require('underscore');

var hexColors = [
    '2BCAF0',
    'FF35B0',
    '8BE841'
];

var loopArray = function (array) {
    var len = array.length;
    var cnt = -1;
    return function () {
        cnt++;
        if (cnt >= len) {
            cnt = 0;
        }
        return array[cnt];
    };
};

var hexColorsLoop = loopArray(hexColors);

var reverseArrayDestructive = function (array) {
    var newArray = [];
    var len      = array.length;
    for (i = 0; i < len; i++) {
        newArray.push(array.pop());
    }
    return newArray;
};

var getTagName = function (tag) {
    return tag.tag;
};

var heightSoFar = function (tagsSoFar, headTagHeight, padding) {
    return _.reduce(tagsSoFar, function (memo, tag) {
        return memo + (headTagHeight * tag.depth) + padding;
    }, 0);
};

var calculateYPosition = function (tag, i, sortedTags, headTagHeight, padding) {
    var heightModifier;

    if (i > 0) {
        heightModifier = heightSoFar(
        sortedTags.slice(0, i),
        headTagHeight, padding);
    } else {
        heightModifier = 0;
    }

    return "translate(0," + heightModifier  + ")";
};

/**
 * The svg elements will appear as follows:
 * <g class="tag"><!-- a single top-level tag group and it's children -->
 *      <g height="{{60 * tag.depth}}" class="{{tag.name}}">
 *          <rect width="{{100%}} height="60">
 *          </rect>
 *          <text>
 *              {{tag.name}}
 *          </text>
 *      </g>
 *      {{#tag.children}}
 *          <g
 *              class="{{child.name}}
 *              height="{{60 * child.depth}}
 *              x={{60 * tag.depth - child.depth}}
 *              y={{tag.children.slice(0, i).width}} // work out children before it
 *          >
 *          </g>
 *      {{/tag.children}}
 * </g>
 */

$.get('/api/tag/top', function(data) {
    var sortedTags    = reverseArrayDestructive(_.sortBy(data, 'count'));
    var numberOfTags  = sortedTags.length;
    var padding       = 10;
    var headTagHeight = 60;
    var tagGroupWidth = $('body').width() - 20;

    var page = d3.select('svg');

    var childMargin = {left: 1, right:1};
    var childScale  = d3.scale.linear();

    childScale.range([0, tagGroupWidth]);

    var appendGroup = function (selection) {
        return selection.append('g');
    };

    var addNewChildGroup = function (tagGroup) {
        var childTagGroups = tagGroup.selectAll('g')
            .data(function (d) {
                if (d.childCount > 0) {
                    return _.map(d.children, function (child) {
                        child.parent = d;
                        return child;
                    });
                } else {
                    return {};
                }

            }).enter().append('g');

        childTagGroups
            .attr('class', getTagName)
            .attr('width', function (child) { // children
                if (!child.width) {
                    var totalSiblingCount = _
                    .reduce(child.parent.children, function (memo, c) {
                        return c.count + memo;
                    }, 0);
                    if (child.parent && child.parent.width) {
                        childScale.range([0, child.parent.width]);
                    }
                    childScale.domain([0, totalSiblingCount]);
                    child.width = childScale(child.count);
                }
                return child.width;
            })
            .attr('transform', function (child, index) {
                if (!child.x || !child.y) {
                    var totalSiblingCount = _
                    .reduce(child.parent.children, function (memo, c) {
                        return c.count + memo;
                    }, 0);
                    childScale.domain([0, totalSiblingCount]);

                    var x = _.reduce(child.parent.children.slice(0, index),
                        function (memo, c) {
                            return memo + c.count;
                        },
                        0);

                    var y = (child.parent.depth * headTagHeight) -
                        ((child.parent.depth - 1) * headTagHeight);

                    child.x = childScale(x);
                    child.y = y;
                }
                return 'translate(' + child.x + ',' + child.y + ')';
            });

        var childTagRects = childTagGroups.append('rect')
            .attr('height', headTagHeight)
            .attr('width', function (child) { // children
                console.log(child);
                if (!child.width) {
                    var totalSiblingCount = _
                    .reduce(child.parent.children, function (memo, c) {
                        return c.count + memo;
                    }, 0);
                    childScale.domain([0, totalSiblingCount]);
                    child.width = childScale(child.count);
                }
                return child.width;
            })
            .attr('title', function (d) {
                return d.tag + ', ' + d.count;
            })
            .style('fill', function () {
                return '#' + hexColorsLoop();
            });

        return childTagGroups;
    };

    var topLevelTagGroup = page.selectAll('g') // set the selection to 'groups'
        .data(sortedTags)                      // feed it the array of top-level tags
        .enter().append('g');                  // create array of grp objects per tag

    topLevelTagGroup
        .attr('width', tagGroupWidth)
        .attr('height', function (d) {
            return d.depth * headTagHeight;
        })
        .attr('class', getTagName)
        .attr('transform', function (d, i) {
            return 'translate(0,' +
                heightSoFar(sortedTags.slice(0, i), headTagHeight, padding) + ')';
        });

    var topLevelRectangle = topLevelTagGroup
        .append('rect')
        .attr('width', tagGroupWidth)
        .attr('height', headTagHeight)
        .style('fill', function () {
            return '#' + hexColorsLoop();
        });

    var childTagGroups = addNewChildGroup(
        appendGroup(topLevelTagGroup).attr('width', tagGroupWidth)
            .attr('height', function (d) {
                return (d.depth - 1) * headTagHeight;
            })
    );

    var childTagGroups2 = addNewChildGroup(
        appendGroup(childTagGroups).attr('width', tagGroupWidth)
            .attr('height', function (d) {
                return (d.depth - 1) * headTagHeight;
            })
    );

    var childTagGroups3 = addNewChildGroup(
            appendGroup(childTagGroups2).attr('width', tagGroupWidth)
                .attr('height', function (d) {
                    return (d.depth - 1) * headTagHeight;
                })
            );

    var childTagGroups4 = addNewChildGroup(
            appendGroup(childTagGroups3).attr('width', tagGroupWidth)
                .attr('height', function (d) {
                    return (d.depth - 1) * headTagHeight;
                })
            );


    $('body').height(function () {
        return heightSoFar(sortedTags, headTagHeight, padding);
    });
});


