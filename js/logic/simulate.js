
function simulate(gameCount, players_in, strategyMatrix) {

	// Don't shuffle the original list of players
	var players = players_in.slice();

	// Shuffle players array in place
	var shufflePlayers = (function(array) {

		// If 2 players, don't shuffle
		if (array.length === 2) {
			return function() { /* No need to shuffle when it's 2 players*/ };
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
	var winA = (function() {

		var prob, random;
		
		return function (sa, sb) {

			prob = strategyMatrix[sa][sb];
			random = Math.random();

			return random < prob;
		}

	})();


	// Run simulation
	var runSimulation = (function() {

		var g, pa, pb, wa, players;
		var logCount = 300;
			logInterval = Math.round(gameCount / logCount);

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
			wa = winA(pa.strategy, pb.strategy);

			// let players update preferences
			/* only their own */
			// pa.callback(pa.strategy, wa);
			// pb.callback(pb.strategy, !wa); // winB = !winA

			/* updte both */
			if (wa) {
				pa.callback(pa.strategy, pb.strategy);
				pb.callback(pa.strategy, pb.strategy);
			} else {
				pa.callback(pb.strategy, pa.strategy);
				pb.callback(pb.strategy, pa.strategy);	
			}

		}

	})();

}
