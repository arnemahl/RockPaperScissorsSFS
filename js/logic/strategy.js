
var Strategy = {};

(function() {

	// Win-rate generator, 'better' strategies win more
	var winA_init = function(scount) {

		var strategies = (function() {

			var i, strategies = [];

			for (i = 0; i < scount; i++) {
				strategies.push(Math.random());
			}

			return strategies;

		})();

		var winA = function(a, b) {
			a = Math.pow(strategies[a] * Math.random(), 2);
			b = Math.pow(strategies[b] * Math.random(), 2);

			return a / (a + b);
		};

		return winA;
	}


	Strategy.generateMatrix = function(scount) {

		var matrix = [
			// rock   paper   scissors
			[ 'tie',  'lose', 'win'  ], // rock
			[ 'win',  'tie',  'lose' ], // paper
			[ 'lose', 'win',  'tie'  ]  // scissors
		];

		return matrix;

	}

	Strategy.getUnbiasedEfficiency = function(scount, matrix) {

		return [ 1/3, 1/3, 1/3 ];

	}

	Strategy.getAveragePreference = function(scount, players) {

		var i, j,
			pcount = players.length,
			pp,
			avg = [];

		for (i = 0; i < scount; i++) {

			avg[i] = 0;

			for (j = 0; j < pcount; j++) {
				pp = players[j].getPreferences()[i];
				avg[i] += pp;
			}

			avg[i] /= pcount;
		}

		return avg;
	}

})();