var log = {

	strategyMatrix: function(scount, strategyMatrix, strategyEfficiency) {

		// log matrix
		var i, j,
			val,
			string = 'Strategy matrix (inverted):\n';

		for (i = 0; i < scount; i++) {
			for (j = 0; j < scount; j++) {

				// val = strategyMatrix[i][j];
				val = strategyMatrix[j][i]; // NB: Inverted
				string += val.toFixed(2) + '   ';
			}

			// if (typeof strategyEfficiency !== 'undefined') {
			// 	string += '\|   '+strategyEfficiency[i].toFixed(2);
			// }

			string += '\n';
		}

		return string;

	},

	strategyEfficiency: function(scount, strategyMatrix) {

		// log Unbiased efficiency
		var i, j,
			val,
			strategyEfficiency = Strategy.getUnbiasedEfficiency( scount, strategyMatrix )
			string = 'Unbiased strategy efficiency:\n';

		for (i = 0; i < scount; i++) {

			val = strategyEfficiency[i];
			string += val.toFixed(2) + '   ';
		}
		string += '\n';

		return string;
	},

	playerPreference: function(scount, players) {

		// log players prefernces
		var i, j,
			pcount = players.length,
			prefs,
			string = 'Player preferenes:\n';

		for (i = 0; i < pcount; i++) {

			prefs = players[i].getPreferences();

			for (j = 0; j < scount; j++) {

				val = prefs[j];
				string += val.toFixed(2) + '   ';
			}

			string += '   '+players[i].getName();
			string += '\n';
		}

		return string;

	},

	averagePreference: function(scount, players) {

		// log average player preferene
		var i, j,
			avg = Strategy.getAveragePreference(scount, players),
			string = 'Average preference\n';

		for (i = 0; i < avg.length; i++) {

			string += avg[i].toFixed(2) + '   ';
		}

		string += '\n';

		return string;

	},

	preferences: function(scount, players) {

		var outString = log.playerPreference(scount, players)
				+'\n'+ log.averagePreference(scount, players)
				+'-------------------------------------------------';

		console.log(outString);

	},

	minimal: function(scount, players) {

		var outString = log.averagePreference(scount, players)
				+'-------------------------------------------------';

		console.log(outString);
	},

	all: function(scount, strategyMatrix, players) {

		var outString = log.strategyMatrix(scount, strategyMatrix)
				+'\n'+ log.strategyEfficiency(scount, strategyMatrix)
				+'\n'+ log.playerPreference(scount, players)
				+'\n'+ log.averagePreference(scount, players)
				+'-------------------------------------------------';

		console.log(outString);

	}

}