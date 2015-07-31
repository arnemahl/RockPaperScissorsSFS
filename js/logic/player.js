

var createPlayer = function(scount, playerName) {

	/* scount = number of strategies */

	// a preference for each strategy (sum of all prefences should be 1)
	var preferences = (function() {

		var preferences = [];

		// make preferences sum up to 1
		for (var i = 0; i < scount; i++) {
			preferences[i] = 1/scount;
		}

		return preferences;

	})();

	// select a strategy, biased towards those with higher preference
	selectStrategy = (function() {
		var i, total, random;

		return function() {

			total = 0;
			random = Math.random();

			for (i = 0; i < scount; i++) {

				total += preferences[i];

				if (random < total) {
					return i;
				}
			}

			console.log('ERROR! No strategy selected, sum total:', total);

			if ( (1-total) < 0.001) {

				console.log('Selected last strategy and moving on');

				return i;
			}

		}

	})();

	// rebalance preferences so the sum of preferences is 1
	var rebalancePreferences = (function() {

		// 'private' variables
		var sum, i;
		var test = 0;

		return function() {

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

		}

	})();

	// update preference based on outcome of a game
	var updatePreference = (function() {

		// temperature: changes preferences faster at higher temperature
		// declines toward 0
		var temperature = .2;
		var updateTemperature = (function() {
			var tmin = 0.05;
			var tscl = 0.01;
			return function() {
				temperature -= (temperature - tmin) * tscl;
			}
		})();

		var updateOne = function(strategy, win) {

			if (win) {
				preferences[strategy] *= 1+temperature;

			} else {
				preferences[strategy] *= 1-temperature;

			}

			updateTemperature();

			rebalancePreferences();
		}
		var updateBoth = function(winner, loser) {

			preferences[winner] *= 1+temperature;
			preferences[loser] *= 1-temperature;

			updateTemperature();

			rebalancePreferences();
		}

		return updateBoth;

	})();

	// player object
	var player = (function() {

		var selectedStrategy;

		return {

			// Main player function
			play: function() {
				selectedStrategy = selectStrategy();

				return {
					// selected strategy for the game
					strategy: selectedStrategy,
					// callback to receive info after the game
					callback: updatePreference
				}
			},

			// Getters
			getPreferences: function() {
				return preferences;
			},

			getName: function() {
				return playerName;
			}

		};
	})();

	return player;

};


// get an array of players
var getPlayers = function(playerCount, scount) {
	
	/* 
	 * playerCount: number of players 
	 * scount: number of strategies 
	 */
	
	var players = [];
	var pname, names = ['Arnold', 'Bob', 'Cherry'];

	for (var i = 0; i < playerCount; i++) {
		pname = (i < names.length ? names[i] : ''+i);
		players.push(createPlayer(scount, pname));
	}

	return players;

};