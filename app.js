// Setting up libraries and configuration
var express = require('express');		// The require() function includes the code for Express
var app = express();					// Initialize the Express library
var http = require('http').Server(app);	// Initialize an HTTP server
var io = require('socket.io')(http);	// Include and initialize SocketIO
var port = process.env.PORT || 8000;	// Set the default port number to 8000, or use Heroku's settings (process.env.PORT)

// Use Express to serve everything in the "public" folder as static files
app.use(express.static('public'));

// Activate the server and listen on our specified port number
http.listen(port, function() {
	// Display this message in the server console once the server is active
	console.log('Listening on port ' + port);
});

var points = [];

// When a user connects over websocket,
io.on('connection', function(socket) {

	// Display this message in the server console
	console.log('A user connected!');

	// When the server receives a message named "new line",
	socket.on('foo line', function(data){

		console.log(points.length);

		// update the points
		points.push(data);
		socket.broadcast.emit('new data', points);
	});

});	// End of SocketIO code
