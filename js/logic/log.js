var Timer = (function() {

	var time = {};

	return {

		start: function() {
			time.t0 = new Date().valueOf();
			delete time.dt;
		},

		stop: function() {
			time.dt = new Date().valueOf() - time.t0;
		},

		elapsed: function() {
			if (time.dt)
				return time.dt;
			else
				return new Date().valueOf() - time.t0;
		}

	};
})();
// Timer = {
// 	start: function() { console.log('Hello!'); },
// 	stop: function() { console.log('Stopped!'); },
// 	elapsed: function() { console.log('Hi?'); return 'asdf'; }
// }

StringHelper = {
	addSpacePadding: function(string, length) {
		var addCount = length - string.length;
		var spaceString = '        ';
		while (spaceString.length < addCount) {
			spaceString = spaceString + spaceString;
		}
		return string + spaceString.substring(0, addCount);
	}
}

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
				string += val + '   ';
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

		return string;

	},

	preferences: function(scount, players) {

		var outString = log.playerPreference(scount, players)
				+'\n'+ log.averagePreference(scount, players)
				+'-------------------------------------------------';

		console.log(outString);

	},

	gamesPlayed: function(players) {
		var string = 'Games played\n';

		Object.keys(players).forEach(function(key) {
			var player = players[key];
			string += StringHelper.addSpacePadding(player.getName(), 8)+player.getGamesPlayed()+'\n';
		});
		string += '-------------------------------------------------';

		return string;
	},

	elapsedTime: function() {
		return 'Finished in '+Timer.elapsed()+' ms';
	},

	output_minimal: function(scount, players) {

		if (System.parameters.output.timeOnly) {
			log.output_timeOnly();
			return;
		}

		var outString = log.averagePreference(scount, players)
				+'\n'+'-------------------------------------------------'
				+'\n'+ log.elapsedTime();

		console.log(outString);
	},

	output_all: function(scount, strategyMatrix, players) {

		if (System.parameters.output.timeOnly) {
			log.output_timeOnly();
			return;
		}

				//'\n'+ log.gamesPlayed(players)
		var outString = log.strategyMatrix(scount, strategyMatrix)
				+'\n'+ log.strategyEfficiency(scount, strategyMatrix)
				+'\n'+ log.playerPreference(scount, players)
				+'\n'+ log.averagePreference(scount, players)
				+'\n'+'-------------------------------------------------'
				+'\n'+ log.elapsedTime();

		console.log(outString);

	},

	output_timeOnly: function() {
		console.log(log.elapsedTime());
	}

}