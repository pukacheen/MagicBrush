// Start a WebSocket connection with the server using SocketIO
var socket = io(); 	// Note that the SocketIO client-side library was imported on line 13 of index.html,
					// and this file (local.js) was imported on line 14 of index.html

// Create a variable for the web page's canvas element, which has id="mycanvas"
var canvas = document.getElementById('mycanvas');
// Create a variable to access the two-dimensional canvas drawing functions
var pen = canvas.getContext('2d');

// Listen for mouse events on the canvas element
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', drawStuff);
canvas.addEventListener('mouseup', stopDrawing);

// Initializing variables for tracking user input
var isDrawing = false;
var lastSent;
var prevX;
var prevY;

// Run this function when the user clicks the mouse
function startDrawing(event) {
	// Display the click coordinates in the web browser's console
	console.log("Clicked at " + event.clientX + ", " + event.clientY);

	// The user began drawing, so save this state to a variable
	isDrawing = true;

	// set the pen properties
  pen.lineWidth = 10;
  pen.lineJoin = pen.lineCap = 'round';
  pen.shadowBlur = 10;
  pen.shadowColor = 'rgb(0, 0, 0)';

	// Save the current timestamp
	lastSent = Date.now();

	// Save the coordinates where user clicked
	prevX = event.clientX;
	prevY = event.clientY;
}

// Run this function when the user moves the mouse
function drawStuff(event) {
	// If the user is holding down the mouse button (isDrawing) AND it's been more than 30 milliseconds since we notified the server
	if (isDrawing && Date.now() - lastSent > 30) {
		// Draw a line from the last saved coordinates to the newly saved coordinates
		pen.beginPath();
		pen.moveTo(prevX, prevY);
		pen.lineTo(event.clientX, event.clientY);
		pen.stroke();

		// Display the previous and current coordinates in the web browser's console
		console.log("Draw from " + prevX + ", " + prevY + " to " + event.clientX + ", " + event.clientY);

		// Update lastSent to the current timestamp
		lastSent = Date.now();

		// Send message named "new line" to the server with an object containing previous and current coordinates
		socket.emit('foo line', {fromX: prevX, fromY: prevY, toX: event.clientX, toY: event.clientY});

		// Replace previous coordinates with the current coordinates (we need this to draw a continuous line)
		prevX = event.clientX;
		prevY = event.clientY;
	}
}

// Run this function when the user unclicks the mouse
function stopDrawing(event) {
	// The user stopped drawing, so update this variable to reflect this change in state
	isDrawing = false;

	// Display the current coordinates in the web browser's console
	console.log("Stop: " + event.clientX + ", " + event.clientY);
}

function redraw(points){
	pen.clearRect(0, 0, pen.canvas.width, pen.canvas.height);
	pen.beginPath();

	var data,i;
	for(i=0; i<points.length; i++){
		data = points[i];
		pen.moveTo(data.fromX, data.fromY);
		pen.lineTo(data.toX, data.toY);
	}
	pen.stroke();
}

socket.on('new data', function(data){
	console.log(data);
	redraw(data);

})
