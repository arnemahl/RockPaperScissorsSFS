var System = {

	// System parameters
	parameters: {
		// Number of strategies
		scount: 4,
		// Number of players
		playerCount: 4,
		// Number of games
		gameCount: 3*1000+1 // +1 so simulation ends on an even number
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
	log.all(p.scount, g.strategyMatrix, S.players);


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
		log.minimal(p.scount, players);

		// Recursive repeat
		repeat(--repetitions);

	};

	if (typeof repetitions === 'number')
		repeat(--repetitions);

};

window.onload =function() {
	var graph = graph_init();
	run();
	graph.draw();
	fbSaveData('test');
};

