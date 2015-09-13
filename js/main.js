var thousand = 1000,
	million = 1000000;

var System = {

	// System parameters
	parameters: {
		// Number of strategies
		scount: 3, /* MUST BE 3 FOR ROCK-PAPER-SCISSORS */
		// Number of players
		playerCount: 350,
		// Number of games
		gameCount: 250*thousand +1, // +1 so simulation ends on an even number
		// Number of times the current state will be logged
		logCount: 250,
		// How to update preference
		preferenceUpdate: {
			method: 'one', // 'one' or 'both'
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
		output: {
			timeOnly: true
		}
	},

	// Generated variables
	generated: {
		// strategyMatrix
	},

	// Players
	players: []

}



function run(repetitions) {
	/* [repetitions]: Number of simulation runs. Will always do one. */


	/* Setup */

	// Parameters
	var p = System.parameters;

	// Generated variables
	var g = System.generated;
	g.strategyMatrix = Strategy.generateMatrix( p.scount );

	/* Init players */
	var S = System;
	S.players = getPlayers( p.playerCount, p.scount );

	/* Init statistics */
	Statistics.init(p.scount, g.strategyMatrix, S.players);

	/* Simulate */
	simulate(p.gameCount, S.players, g.strategyMatrix);

	/* Output */
	log.output_all(p.scount, g.strategyMatrix, S.players);


	/* Repeat simulation with same parameters and generatd variables */
	repeat = function(repetitions) {

		// return if repetitions is undefined or has reached 0
		if (repetitions < 1)
			return;

		/* Init players */
		var players = getPlayers( p.playerCount, p.scount );

		/* Simulate */
		simulate(p.gameCount, players, g.strategyMatrix);

		/* Output */
		log.output_minimal(p.scount, players);

		// Recursive repeat
		repeat(--repetitions);

	};

	if (typeof repetitions === 'number')
		repeat(--repetitions);

};

window.onload =function() {
	var graph = graph_init();
	run(System.parameters.nofRuns);
	graph.draw();
	// fbSaveData('test'); /* Don't save for RPS */
};

