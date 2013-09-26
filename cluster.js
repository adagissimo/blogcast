var cluster = require('cluster');
var os = require('os');

var numCPUs = os.cpus().length;

var workers = {};
if (cluster.isMaster) {
	cluster.on('death', function(worker) {
		console.log('pid:' + worker.pid + 'died.');
		delete workers[worker.pid];
		worker = cluster.fork();
		workers[worker.pid] = worker;
	});

	for (var i = 0; i < numCPUs; ++i) {
		var worker = cluster.fork();
		workers[worker.pid] = worker;
	}
} else {
	var app = require('./app');
	app.startServer();
}

process.on('SIGTERM', function() {
	console.log('MSG: SIGTERM');
	for (var pid in workers) {
		process.kill(pid);
	}
	process.exit(0);
});