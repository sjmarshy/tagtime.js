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

$.get('/api/tag/top', function(data) {
    var sortedTags    = reverseArrayDestructive(_.sortBy(data, 'count'));
    var numberOfTags  = sortedTags.length;
    var padding       = 10;
    var headTagHeight = 60;
    var tagWidth      = $('body').width() - 20;

    var page = d3.select('svg');

    var childScale = d3.scale.linear();

    childScale.range([0, tagWidth]);

    var tag = page.selectAll('g')
        .data(sortedTags).enter()
        .append('g')
        .classed('tag', true)
        .attr('height', function (tag) {
            return headTagHeight * tag.depth;
        })
        .attr('width', tagWidth)
        .attr('transform', function (tag, i) {
            return calculateYPosition(tag, i, sortedTags, headTagHeight, padding);
        });

    tag.append('rect')
        .attr('width', tagWidth)
        .attr('height', function () {
            return headTagHeight;
        })
        .attr('title', function (tag) {
            return tag.count;
        })
        .style('fill', function () {
            return '#' + hexColorsLoop();
        });

    tag.append('text')
        .attr('y', 15)
        .attr('x', 10)
        .style('fill', 'white')
        .text(getTagName);

    tag.append('g').classed('child', true)
        .attr('width', tagWidth);


    var child = tag.selectAll('.child').selectAll('rect')
        .data(function(d) {
            if (d.childCount > 0) {
                var children = d.children;
                var totalCount = _.chain(children).map(function (tag) {
                    return tag.count;
                }).reduce(function (memo, tagCount) {
                    return memo + tagCount;
                }).value();

                var getChildWidth = function (count) {
                    childScale.domain([0, totalCount]);
                    return childScale(count);
                };

                var previousChildrenWidth = function (i) {
                    return _.reduce(children.slice(0, i), function (memo, child) {
                        return memo + getChildWidth(child.count);
                    }, 0);
                };

                return _.map(children, function (tag, i) {
                    return {
                        tag: tag,
                        width: getChildWidth(tag.count),
                        left: previousChildrenWidth(i),
                        totalCount: totalCount
                    };
                });
            } else {
                return {};
            }
        }).enter().append('rect');

    child
        .attr('height', headTagHeight)
        .attr('width', function (d) {
            return d.width;
        })
        .attr('transform', function (d) {
            return 'translate(' + d.left + ',' + (headTagHeight + 2) + ')';
        })
        .attr('title', function (d) {
            return d.tag.tag + ', ' + d.tag.count;
        })
        .style('fill', function () {
            return '#' + hexColorsLoop();
        });

    $('body').height(function () {
        return heightSoFar(sortedTags, headTagHeight, padding);
    });
});


