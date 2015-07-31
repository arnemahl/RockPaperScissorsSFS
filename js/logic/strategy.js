
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

		var i, j, row, matrix = [];
		winA = winA_init(scount);
		
		for (i = 0; i < scount; i++) {

			row = [];
			matrix[i] = row;

			// symmetric probability
			// win-rate = 1 - 'lose-rate'
			for (j = 0; j < i; j++) {
				row[j] = 1-matrix[j][i];
			}

			// 50% probability vs self
			row[j++] = .5;

			// generate win-rate against unencountered strategies
			for (/* continue j **/; j < scount; j++) {
				row[j] = winA(i, j); // better chance of winning for an overall better strategy
			}
		}

		return matrix;

	}

	Strategy.getUnbiasedEfficiency = function(scount, matrix) {
		/* Win rate against a randomly drawn strategy, as opposed to against biased strategy selection */

		var i, j, seff = [];

		for (i = 0; i < scount; i++) {
			seff[i] = 0; //-0.5; // -0.5 because it's got 0.5 against itself
			for (j = 0; j < scount; j++) {
				seff[i] += matrix[i][j];
			}
			seff[i] /= scount;
		}

		return seff;

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