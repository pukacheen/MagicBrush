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

  // pen.lineWidth = 10;
  // pen.lineJoin = pen.lineCap = 'round';
  // pen.shadowBlur = 10;
  // pen.shadowColor = 'rgb(0, 0, 0)';

	// Save the current timestamp
	lastSent = Date.now();

	// Save the coordinates where user clicked
	prevX = event.clientX;
	prevY = event.clientY;
}


// utility functions for points

function distanceBetween(point1, point2) {
  return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
}
function angleBetween(point1, point2) {
  return Math.atan2( point2.x - point1.x, point2.y - point1.y );
}

function makePoint(point){
	return {
		x: point.toX,
		y: point.toY
	}
}

function paint(x,y){
	// draw gradient at x,y
	var width = 20;
	var radgrad = pen.createRadialGradient(
		x,y,width/2,x,y,width);
	radgrad.addColorStop(0, '#000');
	radgrad.addColorStop(0.5, 'rgba(0,0,0,0.5)');
	radgrad.addColorStop(1, 'rgba(0,0,0,0)');
	pen.fillStyle = radgrad;
	pen.fillRect(x-width, y-width, 2* width, 2*width);
}

function marchPaint(p1, p2){
  var dist = distanceBetween(p1, p2);
  var angle = angleBetween(p1, p2);

	// step forward by 5 pixels when adding points
	var x,y;
	for(var t=0; t<dist; t+=5){
	    x = p1.x + (Math.sin(angle) * t);
	    y = p1.y + (Math.cos(angle) * t);
			paint(x,y);
	}
}

// Run this function when the user moves the mouse
function drawStuff(event) {
	// If the user is holding down the mouse button (isDrawing) AND it's been more than 30 milliseconds since we notified the server
	if (isDrawing && Date.now() - lastSent > 30) {

		// paint the new stuff
		var newX = event.clientX;
		var newY = event.clientY;

		// pen.beginPath()
		// linePaint()...
		// pen.stroke()
	  marchPaint({
			x: prevX,
			y: prevY
		},{
			x: newX,
			y: newY
		})

		// Display the previous and current coordinates in the web browser's console
		console.log("Draw from " + prevX + ", " + prevY + " to " + newX + ", " + newY);

		// Update lastSent to the current timestamp
		lastSent = Date.now();

		// Send message named "new line" to the server with an object containing previous and current coordinates
		socket.emit('draw', {fromX: prevX, fromY: prevY, toX: newX, toY: newY});

		// Replace previous coordinates with the current coordinates (we need this to draw a continuous line)
		prevX = newX;
		prevY = newY;
	}
}

// Run this function when the user unclicks the mouse
function stopDrawing(event) {
	// The user stopped drawing, so update this variable to reflect this change in state
	isDrawing = false;

	// Display the current coordinates in the web browser's console
	console.log("Stop: " + event.clientX + ", " + event.clientY);
}


function redrawPoints(points){
	// clear the canvas
	pen.clearRect(0, 0, pen.canvas.width, pen.canvas.height);

	// draw dots for every point
	for(var i=0;i<points.length;i++){
		var point = points[i];
		marchPaint({
			x: point.fromX,
			y: point.fromY
		}, {
			x: point.toX,
			y: point.toY
		});

	}
}

socket.on('connect', function(){
	console.log("Robot 1, reporting for duty!");
});

socket.on('new data', function(data){
	console.log("received data!");
	redrawPoints(data);
});

socket.on('draw', function(data){
	console.log("drawing");

	var point = data;
	marchPaint({
		x: point.fromX,
		y: point.fromY
	}, {
		x: point.toX,
		y: point.toY
	});
})

var clear = document.getElementById('clear_button');
clear.onclick = function(event){
	socket.emit('clear');

	// clear my screen
	redrawPoints([]);
}
