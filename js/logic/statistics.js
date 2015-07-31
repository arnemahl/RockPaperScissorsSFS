var Statistics = {

	data: {
		timings: [],
		strategies: []
	},

	init: function(scount) {

		for (var i = 0; i < scount; i++) {
			var s = {
				averagePreferences: []
			};
			Statistics.data.strategies.push(s);
		}
	},

	collect: function(time) {

		// variables
		var i, avgPref,
			scount = System.parameters.scount,
			players = System.players,
			timings = Statistics.data.timings,
			strategies = Statistics.data.strategies;

		// Replace the function itself first time it's called 
		// (ensures everything is initialized before variables above are set)
		Statistics.collect = function(time) {
			timings.push(time);

			avgPref = Strategy.getAveragePreference(scount, players);

			for (i = 0; i < scount; i++) {
				strategies[i].averagePreferences.push(avgPref[i]);
			}
		}

		// Call the new function
		Statistics.collect(time);
	}

};


Calc = {

	cumulativeMovingAverage: function(array) {
		var i, 
			sum = 0, 
			length = array.length,
			cma = [];

		cma[0] = array[0];

		for (i = 1; i < array.length; i++) {
			sum += array[i];
			cma[i] = sum / i;
		}

		return cma;
	}

};