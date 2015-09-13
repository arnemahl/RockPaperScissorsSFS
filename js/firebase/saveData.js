
fbSaveData = function(notes) {

	var ref = new Firebase("https://rock-paper-scissors-stats.firebaseio.com/");

	ref.push({

		// System parameters & variables
		System: {
			parameters: System.parameters,
			generated: System.generated
		},

		// all stats wrapped in one object
		statistics: Statistics.data,

		// Notes: Anything to note about the simulation
		notes: notes
	});

}