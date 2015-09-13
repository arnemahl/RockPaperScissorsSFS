
function simulate(gameCount, players_in, strategyMatrix) {

	// Don't shuffle the original list of players
	var players = players_in.slice();

	// Shuffle players array in place
	var shufflePlayers = (function(array) {

		// If 2 players, don't shuffle
		if (array.length === 2) {
			return function() { return array; /* No need to shuffle when it's 2 players*/ };
		}


		// Knuth shuffle, 
		// source: http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array

		return function() {

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

	})(players); // the array to be shuffled is players


	// 'Simulate' whether strategy A beats strategy B
	var outcomeForA = (function() {

		var outocme;
		
		return function (sa, sb) {

			outocme = strategyMatrix[sa][sb];

			return outocme;
		}

	})();

	var updatePreferences = (function() {
		if (System.parameters.preferenceUpdate.method === 'one') {
			/* only preference of their own strategy */
			var winA;
			return function(outcomeForA, pa, pb) {
				if (outcomeForA !== 'tie') {
					pa.callback(pa.strategy, outcomeForA === 'win');
					pb.callback(pb.strategy, outcomeForA === 'lose');
				}
			}

		} else if (System.parameters.preferenceUpdate.method === 'both') {
			/* updte preference of both strategies */
			return function(outcomeForA, pa, pb) {
				if (outcomeForA === 'win') {
					pa.callback(pa.strategy, pb.strategy);
					pb.callback(pa.strategy, pb.strategy);
				} else if (outcomeForA === 'lose') {
					pa.callback(pb.strategy, pa.strategy);
					pb.callback(pb.strategy, pa.strategy);
				}
			}

		}
	})();

	// Run simulation
	var runSimulation = (function() {

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

	});

	// Run simulation but with less shuffling
	var runSimulation_minimumShuffling = (function() {

		var g, i, j, pa, pb, wa, players;
		var logCount = Math.min(System.parameters.logCount, gameCount);
		var logInterval = Math.round(gameCount / logCount);

		var x = 0;

		// repeat for <gameCount> number of games
		for (g = 0; g < gameCount; /**/) {

			// shuffle players
			players = shufflePlayers();

			for (i = 0; (i < players.length-1) && (g < gameCount); i++) {
				for (j = 0; (j < players.length) && (g < gameCount); j++, g++ ) {

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

	});


	Timer.start();

	if (System.parameters.simulation.minimumShuffling)
		runSimulation_minimumShuffling();
	else
		runSimulation();

	Timer.stop();

}
