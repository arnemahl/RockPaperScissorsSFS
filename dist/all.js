var thousand = 1000, million = 1000000;
var System = {
  // System parameters
  parameters: {
    // Number of strategies
    scount: 3,
    /* MUST BE 3 FOR ROCK-PAPER-SCISSORS */
    // Number of players
    playerCount: 450,
    // Number of games
    gameCount: 250 * thousand + 1,
    // +1 so simulation ends on an even number
    // Number of times the current state will be logged
    logCount: 250,
    // How to update preference
    preferenceUpdate: {
      method: 'one',
      // 'one' or 'both'
      temperature: {
        start: 0.2,
        min: 0.01,
        scl: 0.05
      }
    },
    simulation: {
      nofRuns: 1,
      minimumShuffling: true
    },
    output: { timeOnly: true }
  },
  // Generated variables
  generated: {},
  // Players
  players: []
};
function run(repetitions) {
  /* [repetitions]: Number of simulation runs. Will always do one. */
  /* Setup */
  // Parameters
  var p = System.parameters;
  // Generated variables
  var g = System.generated;
  g.strategyMatrix = Strategy.generateMatrix(p.scount);
  /* Init players */
  var S = System;
  S.players = getPlayers(p.playerCount, p.scount);
  /* Init statistics */
  Statistics.init(p.scount, g.strategyMatrix, S.players);
  /* Simulate */
  simulate(p.gameCount, S.players, g.strategyMatrix);
  /* Output */
  log.output_all(p.scount, g.strategyMatrix, S.players);
  /* Repeat simulation with same parameters and generatd variables */
  repeat = function (repetitions) {
    // return if repetitions is undefined or has reached 0
    if (repetitions < 1)
      return;
    /* Init players */
    var players = getPlayers(p.playerCount, p.scount);
    /* Simulate */
    simulate(p.gameCount, players, g.strategyMatrix);
    /* Output */
    log.output_minimal(p.scount, players);
    // Recursive repeat
    repeat(--repetitions);
  };
  if (typeof repetitions === 'number')
    repeat(--repetitions);
}
window.onload = function () {
  var graph = graph_init();
  run(System.parameters.nofRuns);
  graph.draw();  // fbSaveData('test'); /* Don't save for RPS */
};
fbSaveData = function (notes) {
  var ref = new Firebase('https://rock-paper-scissors-stats.firebaseio.com/');
  ref.push({
    // System parameters & variables
    System: {
      parameters: System.parameters,
      generated: System.generated
    },
    // all stats wrapped in one object
    statistics: Statistics.data,
    // Notes: Anything to note about the simulation
    notes: notes
  });
};
var Timer = function () {
  var time = {};
  return {
    start: function () {
      time.t0 = new Date().valueOf();
      delete time.dt;
    },
    stop: function () {
      time.dt = new Date().valueOf() - time.t0;
    },
    elapsed: function () {
      if (time.dt)
        return time.dt;
      else
        return new Date().valueOf() - time.t0;
    }
  };
}();
// Timer = {
// 	start: function() { console.log('Hello!'); },
// 	stop: function() { console.log('Stopped!'); },
// 	elapsed: function() { console.log('Hi?'); return 'asdf'; }
// }
StringHelper = {
  addSpacePadding: function (string, length) {
    var addCount = length - string.length;
    var spaceString = '        ';
    while (spaceString.length < addCount) {
      spaceString = spaceString + spaceString;
    }
    return string + spaceString.substring(0, addCount);
  }
};
var log = {
  strategyMatrix: function (scount, strategyMatrix, strategyEfficiency) {
    // log matrix
    var i, j, val, string = 'Strategy matrix (inverted):\n';
    for (i = 0; i < scount; i++) {
      for (j = 0; j < scount; j++) {
        // val = strategyMatrix[i][j];
        val = strategyMatrix[j][i];
        // NB: Inverted
        string += val + '   ';
      }
      // if (typeof strategyEfficiency !== 'undefined') {
      // 	string += '\|   '+strategyEfficiency[i].toFixed(2);
      // }
      string += '\n';
    }
    return string;
  },
  strategyEfficiency: function (scount, strategyMatrix) {
    // log Unbiased efficiency
    var i, j, val, strategyEfficiency = Strategy.getUnbiasedEfficiency(scount, strategyMatrix);
    string = 'Unbiased strategy efficiency:\n';
    for (i = 0; i < scount; i++) {
      val = strategyEfficiency[i];
      string += val.toFixed(2) + '   ';
    }
    string += '\n';
    return string;
  },
  playerPreference: function (scount, players) {
    // log players prefernces
    var i, j, pcount = players.length, prefs, string = 'Player preferenes:\n';
    for (i = 0; i < pcount; i++) {
      prefs = players[i].getPreferences();
      for (j = 0; j < scount; j++) {
        val = prefs[j];
        string += val.toFixed(2) + '   ';
      }
      string += '   ' + players[i].getName();
      string += '\n';
    }
    return string;
  },
  averagePreference: function (scount, players) {
    // log average player preferene
    var i, j, avg = Strategy.getAveragePreference(scount, players), string = 'Average preference\n';
    for (i = 0; i < avg.length; i++) {
      string += avg[i].toFixed(2) + '   ';
    }
    return string;
  },
  preferences: function (scount, players) {
    var outString = log.playerPreference(scount, players) + '\n' + log.averagePreference(scount, players) + '-------------------------------------------------';
    console.log(outString);
  },
  gamesPlayed: function (players) {
    var string = 'Games played\n';
    Object.keys(players).forEach(function (key) {
      var player = players[key];
      string += StringHelper.addSpacePadding(player.getName(), 8) + player.getGamesPlayed() + '\n';
    });
    string += '-------------------------------------------------';
    return string;
  },
  elapsedTime: function () {
    return 'Finished in ' + Timer.elapsed() + ' ms';
  },
  output_minimal: function (scount, players) {
    if (System.parameters.output.timeOnly) {
      log.output_timeOnly();
      return;
    }
    var outString = log.averagePreference(scount, players) + '\n' + '-------------------------------------------------' + '\n' + log.elapsedTime();
    console.log(outString);
  },
  output_all: function (scount, strategyMatrix, players) {
    if (System.parameters.output.timeOnly) {
      log.output_timeOnly();
      return;
    }
    //'\n'+ log.gamesPlayed(players)
    var outString = log.strategyMatrix(scount, strategyMatrix) + '\n' + log.strategyEfficiency(scount, strategyMatrix) + '\n' + log.playerPreference(scount, players) + '\n' + log.averagePreference(scount, players) + '\n' + '-------------------------------------------------' + '\n' + log.elapsedTime();
    console.log(outString);
  },
  output_timeOnly: function () {
    console.log(log.elapsedTime());
  }
};
var createPlayer = function (scount, playerName) {
  /* scount = number of strategies */
  var gamesPlayed = 0;
  // a preference for each strategy (sum of all prefences should be 1)
  var preferences = function () {
    var preferences = [];
    // make preferences sum up to 1
    for (var i = 0; i < scount; i++) {
      preferences[i] = 1 / scount;
    }
    return preferences;
  }();
  // select a strategy, biased towards those with higher preference
  selectStrategy = function () {
    var i, total, random;
    return function () {
      total = 0;
      random = Math.random();
      for (i = 0; i < scount; i++) {
        total += preferences[i];
        if (random < total) {
          return i;
        }
      }
      console.log('ERROR! No strategy selected, sum total:', total);
      if (1 - total < 0.001) {
        console.log('Selected last strategy and moving on');
        return i;
      }
    };
  }();
  // rebalance preferences so the sum of preferences is 1
  var rebalancePreferences = function () {
    // 'private' variables
    var sum, i;
    var test = 0;
    return function () {
      // reset sum
      sum = 0;
      // calculate sums
      for (i = 0; i < scount; i++) {
        sum += preferences[i];
      }
      // rebalance so the new sum of preferences is 1
      for (i = 0; i < scount; i++) {
        preferences[i] /= sum;
      }
    };
  }();
  // update preference based on outcome of a game
  var updatePreference = function () {
    // temperature: preferences change faster at higher temperature.
    // temperature declines toward tmin, at a rate set by tscl.
    var temperature, updateTemperature;
    (function () {
      var sst = System.parameters.preferenceUpdate.temperature;
      var tmin = sst.min;
      var tscl = sst.scl;
      temperature = sst.start;
      updateTemperature = function () {
        temperature -= (temperature - tmin) * tscl;
      };
    }());
    var updateOne = function (strategy, win) {
      if (win) {
        preferences[strategy] *= 1 + temperature;
      } else {
        preferences[strategy] *= 1 - temperature;
      }
      updateTemperature();
      rebalancePreferences();
    };
    var updateBoth = function (winner, loser) {
      preferences[winner] *= 1 + temperature;
      preferences[loser] *= 1 - temperature;
      updateTemperature();
      rebalancePreferences();
    };
    if (System.parameters.preferenceUpdate.method === 'one')
      return updateOne;
    else if (System.parameters.preferenceUpdate.method === 'both')
      return updateBoth;
  }();
  // player object
  var player = function () {
    var selectedStrategy;
    return {
      // Main player function
      play: function () {
        gamesPlayed++;
        selectedStrategy = selectStrategy();
        return {
          // selected strategy for the game
          strategy: selectedStrategy,
          // callback to receive info after the game
          callback: updatePreference
        };
      },
      // Getters
      getPreferences: function () {
        return preferences;
      },
      getName: function () {
        return playerName;
      },
      getGamesPlayed: function () {
        return gamesPlayed;
      }
    };
  }();
  return player;
};
// get an array of players
var getPlayers = function (playerCount, scount) {
  /* 
	 * playerCount: number of players 
	 * scount: number of strategies 
	 */
  var players = [];
  var pname, names = [
      'Arnold',
      'Bob',
      'Cherry'
    ];
  for (var i = 0; i < playerCount; i++) {
    pname = i < names.length ? names[i] : '' + i;
    players.push(createPlayer(scount, pname));
  }
  return players;
};
function simulate(gameCount, players_in, strategyMatrix) {
  // Don't shuffle the original list of players
  var players = players_in.slice();
  // Shuffle players array in place
  var shufflePlayers = function (array) {
    // If 2 players, don't shuffle
    if (array.length === 2) {
      return function () {
        return array;  /* No need to shuffle when it's 2 players*/
      };
    }
    // Knuth shuffle, 
    // source: http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    return function () {
      // Variables
      var currentIndex = array.length, temporaryValue, randomIndex;
      // While there remain elements to shuffle...
      while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }
      return array;
    };
  }(players);
  // the array to be shuffled is players
  // 'Simulate' whether strategy A beats strategy B
  var outcomeForA = function () {
    var outocme;
    return function (sa, sb) {
      outocme = strategyMatrix[sa][sb];
      return outocme;
    };
  }();
  var updatePreferences = function () {
    if (System.parameters.preferenceUpdate.method === 'one') {
      /* only preference of their own strategy */
      var winA;
      return function (outcomeForA, pa, pb) {
        if (outcomeForA !== 'tie') {
          pa.callback(pa.strategy, outcomeForA === 'win');
          pb.callback(pb.strategy, outcomeForA === 'lose');
        }
      };
    } else if (System.parameters.preferenceUpdate.method === 'both') {
      /* updte preference of both strategies */
      return function (outcomeForA, pa, pb) {
        if (outcomeForA === 'win') {
          pa.callback(pa.strategy, pb.strategy);
          pb.callback(pa.strategy, pb.strategy);
        } else if (outcomeForA === 'lose') {
          pa.callback(pb.strategy, pa.strategy);
          pb.callback(pb.strategy, pa.strategy);
        }
      };
    }
  }();
  // Run simulation
  var runSimulation = function () {
    var g, pa, pb, wa, players;
    var logCount = Math.min(System.parameters.logCount, gameCount);
    var logInterval = Math.round(gameCount / logCount);
    // repeat for <gameCount> number of games
    for (g = 0; g < gameCount; g++) {
      // Stats: collect
      if (g % logInterval === 0) {
        Statistics.collect(g);
      }
      // shuffle players
      players = shufflePlayers();
      // pick the two first ones
      pa = players[0].play();
      pb = players[1].play();
      // does player A win?
      oa = outcomeForA(pa.strategy, pb.strategy);
      // let players update preferences
      updatePreferences(oa, pa, pb);
    }
  };
  // Run simulation but with less shuffling
  var runSimulation_minimumShuffling = function () {
    var g, i, j, pa, pb, wa, players;
    var logCount = Math.min(System.parameters.logCount, gameCount);
    var logInterval = Math.round(gameCount / logCount);
    var x = 0;
    // repeat for <gameCount> number of games
    for (g = 0; g < gameCount;) {
      // shuffle players
      players = shufflePlayers();
      for (i = 0; i < players.length - 1 && g < gameCount; i++) {
        for (j = 0; j < players.length && g < gameCount; j++, g++) {
          // Stats: collect
          if (g % logInterval === 0) {
            Statistics.collect(g);
          }
          // pick the two first ones
          pa = players[i].play();
          pb = players[i].play();
          // does player A win?
          oa = outcomeForA(pa.strategy, pb.strategy);
          // let players update preferences
          updatePreferences(oa, pa, pb);
        }
      }
    }
  };
  Timer.start();
  if (System.parameters.simulation.minimumShuffling)
    runSimulation_minimumShuffling();
  else
    runSimulation();
  Timer.stop();
}
var Statistics = {
  data: {
    timings: [],
    strategies: []
  },
  init: function (scount) {
    for (var i = 0; i < scount; i++) {
      var s = { averagePreferences: [] };
      Statistics.data.strategies.push(s);
    }
  },
  collect: function (time) {
    // variables
    var i, avgPref, scount = System.parameters.scount, players = System.players, timings = Statistics.data.timings, strategies = Statistics.data.strategies;
    // Replace the function itself first time it's called 
    // (ensures everything is initialized before variables above are set)
    Statistics.collect = function (time) {
      timings.push(time);
      avgPref = Strategy.getAveragePreference(scount, players);
      for (i = 0; i < scount; i++) {
        strategies[i].averagePreferences.push(avgPref[i]);
      }
    };
    // Call the new function
    Statistics.collect(time);
  }
};
Calc = {
  cumulativeMovingAverage: function (array) {
    var i, sum = 0, length = array.length, cma = [];
    cma[0] = array[0];
    for (i = 1; i < array.length; i++) {
      sum += array[i];
      cma[i] = sum / i;
    }
    return cma;
  }
};
var Strategy = {};
(function () {
  // Win-rate generator, 'better' strategies win more
  var winA_init = function (scount) {
    var strategies = function () {
      var i, strategies = [];
      for (i = 0; i < scount; i++) {
        strategies.push(Math.random());
      }
      return strategies;
    }();
    var winA = function (a, b) {
      a = Math.pow(strategies[a] * Math.random(), 2);
      b = Math.pow(strategies[b] * Math.random(), 2);
      return a / (a + b);
    };
    return winA;
  };
  Strategy.generateMatrix = function (scount) {
    var matrix = [
      // rock   paper   scissors
      [
        'tie',
        'lose',
        'win'
      ],
      // rock
      [
        'win',
        'tie',
        'lose'
      ],
      // paper
      [
        'lose',
        'win',
        'tie'
      ]  // scissors
    ];
    return matrix;
  };
  Strategy.getUnbiasedEfficiency = function (scount, matrix) {
    return [
      1 / 3,
      1 / 3,
      1 / 3
    ];
  };
  Strategy.getAveragePreference = function (scount, players) {
    var i, j, pcount = players.length, pp, avg = [];
    for (i = 0; i < scount; i++) {
      avg[i] = 0;
      for (j = 0; j < pcount; j++) {
        pp = players[j].getPreferences()[i];
        avg[i] += pp;
      }
      avg[i] /= pcount;
    }
    return avg;
  };
}());
var drawGraph = function () {
  // Positional parameters
  var xMargin, yMargin, width, height, ccSize, ccInterval, initialized, gcount = 0;
  function init(raphael) {
    xMargin = 25;
    yMargin = 0;
    width = raphael.width - 2 * xMargin;
    height = raphael.height - 2 * yMargin;
    ccSize = 30;
    ccInterval = 40;
    raphael = raphael;
    initialized = true;
  }
  var nextColorHue = function () {
    var hue = 0, dhue = 0.37;
    return function () {
      gcount++;
      hue = (hue + dhue) % 1;
      return hue;
    };
  }();
  var getPositionalizer = function (labels, data) {
    var graphWidth = width - xMargin - ccSize;
    var pos = {
      x: function () {
        var max = labels[labels.length - 1];
        return function (i) {
          return xMargin + labels[i] * graphWidth / max;
        };
      }(),
      y: function (i) {
        return height * (1 - data[i]);
      },
      labelIndex: function () {
        var i, v, length = labels.length, halfStep = (labels[1] - labels[0]) / 2;
        return function (value) {
          i = labels.indexOf(Math.round(value));
          if (i !== -1)
            return i;
          if (value < labels[0])
            return 0;
          for (i = 0; i < length; i++) {
            v = labels[i];
            if (Math.abs(value - v) <= halfStep) {
              return i;  // closest i
            }
          }
          if (value > v)
            return length - 1;
          console.log('omgwtf', value, v, halfStep);
        };
      }(),
      invX: function () {
        var label, i, max = labels[labels.length - 1];
        return function (x) {
          label_i = (x - xMargin) * max / graphWidth;
          i = pos.labelIndex(label_i);
          // console.log('asdf', x, i, pos.x(i));
          return i;
        };
      }()
    };
    return pos;
  };
  var getAnchors = function (p1x, p1y, p2x, p2y, p3x, p3y) {
    // Source: http://raphaeljs.com/analytics.html
    var l1 = (p2x - p1x) / 2, l2 = (p3x - p2x) / 2, a = Math.atan((p2x - p1x) / Math.abs(p2y - p1y)), b = Math.atan((p3x - p2x) / Math.abs(p2y - p3y));
    a = p1y < p2y ? Math.PI - a : a;
    b = p3y < p2y ? Math.PI - b : b;
    var alpha = Math.PI / 2 - (a + b) % (Math.PI * 2) / 2, dx1 = l1 * Math.sin(alpha + a), dy1 = l1 * Math.cos(alpha + a), dx2 = l2 * Math.sin(alpha + b), dy2 = l2 * Math.cos(alpha + b);
    return {
      x1: p2x - dx1,
      y1: p2y + dy1,
      x2: p2x + dx2,
      y2: p2y + dy2
    };
  };
  var calculatePath = function (labels, data, pos) {
    // Create path
    var i, a, last = data.length - 1;
    var p = [
      'M',
      pos.x(0),
      pos.y(0),
      'C',
      pos.x(0),
      pos.y(0)
    ];
    // first point
    for (i = 1; i < last; i++) {
      a = getAnchors(pos.x(i - 1), pos.y(i - 1), pos.x(i), pos.y(i), pos.x(i + 1), pos.y(i + 1));
      p = p.concat([
        // intermediate points
        a.x1,
        a.y1,
        pos.x(i),
        pos.y(i),
        a.x2,
        a.y2
      ]);
    }
    p = p.concat([
      pos.x(last),
      pos.y(last),
      pos.x(last),
      pos.y(last)
    ]);
    // last point
    return p;
  };
  var addColorCoding = function (raphael, colorhue, pathElement, pathSet) {
    // Varibales
    var w = ccSize, h = ccSize, dh = ccInterval;
    /* Create Elements */
    // colors
    var mediumDark = 'hsl(' + [
      colorhue,
      0.75,
      0.25
    ] + ')';
    var mediumLight = 'hsl(' + [
      colorhue,
      0.5,
      0.5
    ] + ')';
    var superLight = 'hsl(' + [
      colorhue,
      0.25,
      1
    ] + ')';
    // elements
    var rect = raphael.rect(xMargin + width - w, yMargin + dh * gcount, w, h).attr({
      fill: mediumLight,
      'stroke-width': 0
    });
    var text = raphael.text(xMargin + width - w / 2, yMargin + dh * gcount + h / 2, gcount).attr({
      fill: mediumDark,
      'font-size': 20
    });
    // set
    var set = raphael.set(rect, text);
    /* Add Interactions */
    // toggle on/off
    var on = true;
    var toggleOn = function () {
      // Show path and toggle button
      pathSet.show();
      set.animate({ opacity: 1 }, 500, '>');
      rect.animate({ transform: 'r0' }, 1000, 'elastic');
      text.animate({ fill: mediumDark }, 500, '>');
    };
    var toggleOff = function () {
      // Hide path and toggle button
      pathSet.hide();
      set.animate({ opacity: 0.25 }, 500, '>');
      rect.animate({ transform: 'r180' }, 1000, 'elastic');
      text.animate({ fill: mediumLight }, 500, '>');
    };
    var toggle = function () {
      on = !on;
      if (on) {
        toggleOn();
      } else {
        toggleOff();
      }
    };
    set.click(function () {
      toggle();
    });
    // hover: bring pathElement to front
    set.hover(function () {
      pathElement.toFront();
    });
  };
  var getGraphPointInfo = function () {
    // Parameters
    var offset = 25, w = 80, h = w / 1.618, r = h / (2 * 1.618), sw = 2, fs = 15;
    return function (raphael, labels, data, pos, colorhue, x_in) {
      // Variables
      var i, rect, text, line, dot, set, x, y, gx, gy, cx, cy;
      // Colors
      var mediumDark = 'hsl(' + [
        colorhue,
        0.75,
        0.25
      ] + ')';
      var mediumLight = 'hsl(' + [
        colorhue,
        0.5,
        0.5
      ] + ')';
      var superLight = 'hsl(' + [
        colorhue,
        0.25,
        0.75
      ] + ')';
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
      cx = x + w / 2;
      cy = y + h / 2;
      // Create elements
      raphael.setStart();
      dot = raphael.circle(gx, gy, 1.5 * sw).attr({
        fill: mediumDark,
        'stroke-width': 0
      });
      line = raphael.path([
        'M',
        gx,
        gy,
        'L',
        cx,
        cy
      ]).attr({
        stroke: mediumDark,
        'stroke-width': sw
      });
      rect = raphael.rect(x, y, w, h, r).attr({
        fill: superLight,
        stroke: mediumDark,
        'stroke-width': sw
      });
      text = raphael.text(cx, cy, 'x: ' + labels[i].toFixed(0) + '\n y: ' + data[i].toFixed(3) + '').attr({
        fill: mediumDark,
        'font-size': fs,
        'font-weight': 700
      });
      // Finish the set, then hide and rotate backwards
      set = raphael.setFinish().attr({
        opacity: 0,
        transform: 'r-180'
      });
      // Functions to 'show/hide'
      set.appear = function (noAnimation) {
        if (noAnimation)
          return set.attr({
            opacity: 1,
            transform: 'r0'
          });  // unhide, rotate to 0
        else
          return set.animate({
            opacity: 1,
            transform: 'r0'
          }, 150, '-');  // unhide, rotate to 0
      };
      set.disappear = function (callback) {
        return set.animate({ opacity: 0 }, 150, '-', callback);  // return set.animate({ opacity: 0, transform: 'r-180' }, 150, '-', callback);
      };
      return set;
    };
  }();
  var addHoverInfo = function (raphael, labels, data, pos, colorhue, pathElement, pathSet) {
    // Keep set between hover in and hover out
    var set;
    pathElement.hover(function (event, x, y) {
      /* Hover in */
      set = getGraphPointInfo(raphael, labels, data, pos, colorhue, x).appear();
    }, function () {
      /* Hover out */
      set.disappear(function () {
        set.remove();
      });
    });
  };
  var addClickInfo = function (raphael, labels, data, pos, colorhue, pathElement, pathSet) {
    /* Click path to add info */
    pathElement.click(function (event, x, y) {
      // Get info, make it appear
      var set = getGraphPointInfo(raphael, labels, data, pos, colorhue, x).appear(true);
      pathSet.push(set);
      // Click info remove it
      set.click(function () {
        set.disappear(function () {
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
    var color = 'hsl(' + [
      colorhue,
      0.5,
      0.5
    ] + ')';
    // Get position calculation functions
    var pos = getPositionalizer(labels, data);
    // Create path element
    var pathElement = raphael.path().attr({
      path: calculatePath(labels, data, pos),
      stroke: color,
      'stroke-width': 4,
      'stroke-linejoin': 'round'
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
}();
var graph_init = function () {
  var raphael = Raphael('graph', window.innerWidth - 20, window.innerHeight - 20);
  // Graph object
  return {
    draw: function () {
      var i;
      for (i = 0; i < System.parameters.scount; i++) {
        drawGraph(raphael, Statistics.data.timings, Statistics.data.strategies[i].averagePreferences);
      }
      for (i = 0; i < System.parameters.scount; i++) {
        drawGraph(raphael, Statistics.data.timings, Calc.cumulativeMovingAverage(Statistics.data.strategies[i].averagePreferences));
      }
    }
  };
};