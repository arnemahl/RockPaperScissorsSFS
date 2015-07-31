
var drawGraph = (function() {


    // Positional parameters
    var xMargin, yMargin, width, height, ccSize, ccInterval, initialized, gcount = 0;

    function init(raphael) {
        xMargin = 25;
        yMargin = 0;
        width = raphael.width - 2*xMargin;
        height = raphael.height - 2*yMargin;
        ccSize = 30;
        ccInterval = 40;
        raphael = raphael;
        initialized = true;
    }


    var nextColorHue = (function() {
        var hue = 0, dhue = .37;
        return function() {
            gcount++;
            hue = (hue + dhue) % 1;
            return hue;
        }
    })();


    var getPositionalizer = function(labels, data) {

        var graphWidth = width - xMargin - ccSize;

        var pos = {

            x: (function() {
                var max = labels[labels.length-1];
                return function(i) {
                    return xMargin + labels[i] * graphWidth / max;
                }
            })(),

            y: function(i) {
                return height * (1 - data[i]);
            },

            labelIndex: (function() {
                var i, v, length = labels.length, halfStep = (labels[1] - labels[0]) / 2;
                
                return function(value) {
                    i = labels.indexOf(Math.round(value));
                    
                    if (i !== -1)
                        return i;

                    if (value < labels[0])
                        return 0;

                    for (i = 0; i < length; i++) {
                        v = labels[i];
                        if (Math.abs(value - v) <= halfStep) {
                            return i; // closest i
                        }
                    }

                    if (value > v)
                        return length-1;

                    console.log('omgwtf', value, v, halfStep);
                }
            })(),

            invX: (function() {
                var label, i, max = labels[labels.length-1];
                return function(x) {
                    label_i = (x - xMargin) * max / graphWidth;
                    i = pos.labelIndex(label_i);
                    // console.log('asdf', x, i, pos.x(i));
                    return i;
                };
            })()

        };
        return pos;

    };


    var getAnchors = function (p1x, p1y, p2x, p2y, p3x, p3y) {
        // Source: http://raphaeljs.com/analytics.html
        var l1 = (p2x - p1x) / 2,
            l2 = (p3x - p2x) / 2,
            a = Math.atan((p2x - p1x) / Math.abs(p2y - p1y)),
            b = Math.atan((p3x - p2x) / Math.abs(p2y - p3y));
        a = p1y < p2y ? Math.PI - a : a;
        b = p3y < p2y ? Math.PI - b : b;
        var alpha = Math.PI / 2 - ((a + b) % (Math.PI * 2)) / 2,
            dx1 = l1 * Math.sin(alpha + a),
            dy1 = l1 * Math.cos(alpha + a),
            dx2 = l2 * Math.sin(alpha + b),
            dy2 = l2 * Math.cos(alpha + b);
        return {
            x1: p2x - dx1,
            y1: p2y + dy1,
            x2: p2x + dx2,
            y2: p2y + dy2
        };
    }


    var calculatePath = function(labels, data, pos) {

        // Create path
        var i, a, last = data.length-1;

        var p = ["M", pos.x(0), pos.y(0), "C", pos.x(0), pos.y(0)]; // first point

        for (i = 1; i < last; i++) {
            a = getAnchors(
                    pos.x(i-1), pos.y(i-1),
                    pos.x(i),   pos.y(i),
                    pos.x(i+1), pos.y(i+1)
                );
            p = p.concat([ // intermediate points
                    a.x1, a.y1,
                    pos.x(i), pos.y(i),
                    a.x2, a.y2
                ]);
        }
        p = p.concat([pos.x(last), pos.y(last), pos.x(last), pos.y(last)]); // last point

        return p;

    };


    var addColorCoding = function(raphael, colorhue, pathElement, pathSet) {
        
        // Varibales
        var w = ccSize, h = ccSize, dh = ccInterval;

        /* Create Elements */

        // colors
        var mediumDark = 'hsl('+[colorhue, .75, .25]+')';
        var mediumLight = 'hsl('+[colorhue, .5, .5]+')';
        var superLight = 'hsl('+[colorhue, .25, 1]+')';

        // elements
        var rect = raphael.rect(
                xMargin + width - w,
                yMargin + dh*gcount,
                w,
                h
            ).attr({ fill: mediumLight, 'stroke-width': 0 });

        var text = raphael.text(
                xMargin + width - w/2,
                yMargin + dh*gcount + h/2,
                gcount
            ).attr({ fill: mediumDark, 'font-size': 20 });

        // set
        var set = raphael.set(rect, text);


        /* Add Interactions */

        // toggle on/off
        var on = true;

        var toggleOn = function() {
            // Show path and toggle button
            pathSet.show();
            set.animate({ opacity: 1 }, 500, '>');
            rect.animate({ transform: 'r0' }, 1000, 'elastic');
            text.animate({ fill: mediumDark }, 500, '>');
        }

        var toggleOff = function() {
            // Hide path and toggle button
            pathSet.hide();
            set.animate({ opacity: .25 }, 500, '>');
            rect.animate({ transform: 'r180' }, 1000, 'elastic');
            text.animate({ fill: mediumLight }, 500, '>');
        }

        var toggle = function() {
            on = !on;
            if (on) {
                toggleOn();
            } else {
                toggleOff();
            }
        }

        set.click(function() {
            toggle();
        });

        // hover: bring pathElement to front
        set.hover(function() {
            pathElement.toFront();
        });


    };

    var getGraphPointInfo = (function() {

        // Parameters
        var offset = 25,
            w = 80,
            h = w / 1.618,
            r = h / (2*1.618),
            sw = 2,
            fs = 15;

        return function(raphael, labels, data, pos, colorhue, x_in) {

            // Variables
            var i, rect, text, line, dot, set, x, y, gx, gy, cx, cy;

            // Colors
            var mediumDark = 'hsl('+[colorhue, .75, .25]+')';
            var mediumLight = 'hsl('+[colorhue, .5, .5]+')';
            var superLight = 'hsl('+[colorhue, .25, .75]+')';

            // Inverse x: Index of label & data to look up
            i = pos.invX(x_in);

            // Set position to point on graph
            x = pos.x(i);
            y = pos.y(i);

            // Keep graph point
            gx = x;
            gy = y;

            // Get position of popup
            if (x + (offset + w) < raphael.width)
                x += offset;
            else
                x -= offset + w;

            if (y - (offset + h) > 0)
                y -= offset + h;
            else
                y += offset;

            // Center position
            cx = x + w/2;
            cy = y + h/2;
 
            // Create elements
            raphael.setStart();

            dot = raphael
                .circle(gx, gy, 1.5*sw)
                .attr({ fill: mediumDark, 'stroke-width': 0 });

            line = raphael
                .path([ 'M', gx, gy, 'L', cx, cy ])
                .attr({ stroke: mediumDark, 'stroke-width': sw });

            rect = raphael
                .rect(x, y, w, h, r)
                .attr({ fill: superLight, stroke: mediumDark, 'stroke-width': sw });

            text = raphael
                .text(cx, cy, 'x: '+labels[i].toFixed(0)+'\n y: '+data[i].toFixed(3)+'' )
                .attr({ fill: mediumDark, 'font-size': fs, 'font-weight': 700 });
            
            // Finish the set, then hide and rotate backwards
            set = raphael.setFinish()
                .attr({ opacity: 0, transform: 'r-180' });

            // Functions to 'show/hide'
            set.appear = function(noAnimation) {
                if (noAnimation)
                    return set.attr({ opacity: 1, transform: 'r0'}); // unhide, rotate to 0
                else
                    return set.animate({ opacity: 1, transform: 'r0'}, 150, '-'); // unhide, rotate to 0
            };
            set.disappear = function(callback) {
                return set.animate({ opacity: 0  }, 150, '-', callback);
                // return set.animate({ opacity: 0, transform: 'r-180' }, 150, '-', callback);
            };

            return set;
        }

    })();

    var addHoverInfo = function(raphael, labels, data, pos, colorhue, pathElement, pathSet) {
        // Keep set between hover in and hover out
        var set;

        pathElement.hover(function(event, x, y) {
            /* Hover in */
            set = getGraphPointInfo(raphael, labels, data, pos, colorhue, x).appear();

        }, function() {
            /* Hover out */ 
            set.disappear(function() {
                set.remove();
            });
        });

    };

    var addClickInfo = function(raphael, labels, data, pos, colorhue, pathElement, pathSet) {

        /* Click path to add info */
        pathElement.click(function(event, x, y) {

            // Get info, make it appear
            var set = getGraphPointInfo(raphael, labels, data, pos, colorhue, x).appear(true);
            pathSet.push(set);

            // Click info remove it
            set.click(function() {
                set.disappear(function() {
                    set.remove();
                });
            });

        });

    };


    // drawGraph function
    return function (raphael, labels, data) {

        // Make sure basic parameters are initialized
        if (!initialized)
            init(raphael);

        // Color stuff
        var colorhue = nextColorHue();
        var color = 'hsl('+[colorhue, .5, .5]+')';

        // Get position calculation functions
        var pos = getPositionalizer(labels, data);

        // Create path element
        var pathElement = raphael.path().attr({ 
            path: calculatePath(labels, data, pos),
            stroke: color,
            "stroke-width": 4,
            "stroke-linejoin": "round" 
        });

        // Creat path set (to keep track of other elements to e.g. show/hide with the path)
        var pathSet = raphael.set(pathElement);

        // Path hover
        addHoverInfo(raphael, labels, data, pos, colorhue, pathElement, pathSet);

        // Path click
        addClickInfo(raphael, labels, data, pos, colorhue, pathElement, pathSet);

        // Encoding and toggler for path
        addColorCoding(raphael, colorhue, pathElement, pathSet);

    };

})();


var graph_init = function() {

    var raphael = Raphael("graph", window.innerWidth-20, window.innerHeight-20);

    // Graph object
    return {
        draw: function() {
            var i;
            for (i = 0; i < System.parameters.scount; i++) {
                drawGraph(
                    raphael,
                    Statistics.data.timings,
                    Statistics.data.strategies[i].averagePreferences);
            }
            for (i = 0; i < System.parameters.scount; i++) {
                drawGraph(
                    raphael,
                    Statistics.data.timings,
                    Calc.cumulativeMovingAverage( Statistics.data.strategies[i].averagePreferences) );
            }
        }
    }

};