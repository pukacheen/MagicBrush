// Start a WebSocket connection with the server using SocketIO
var socket = io(); 	// Note that the SocketIO client-side library was imported on line 13 of index.html,
					// and this file (local.js) was imported on line 14 of index.html

// Create a variable for the web page's canvas element, which has id="mycanvas"
var canvas = document.getElementById('mycanvas');
// Create a variable to access the two-dimensional canvas drawing functions
var pen = canvas.getContext('2d');

var uid = Math.random();

function drawBase(callback=null){
	var baseImage = new Image;
	baseImage.onload = function(){
		pen.drawImage(baseImage, 0, 0);
		if (callback !== null){
			callback();
		}
	}
	baseImage.src = './pikachu.jpg';
}
drawBase();

// Listen for mouse events on the canvas element
canvas.addEventListener('mousedown', sendCoordinates(canvas, startDrawing));
canvas.addEventListener('mousemove', sendCoordinates(canvas, drawStuff));
canvas.addEventListener('mouseup', sendCoordinates(canvas, stopDrawing));

// Listen for mouse events on the canvas element
var canvas2 = document.getElementById('mycanvas2');
canvas2.addEventListener('mousedown', sendCoordinates(canvas2, startDrawing));
canvas2.addEventListener('mousemove', sendCoordinates(canvas2, drawStuff));
canvas2.addEventListener('mouseup', sendCoordinates(canvas2, stopDrawing));

// Initializing variables for tracking user input
var isDrawing = false;
var lastSent;
var prevX;
var prevY;

// Initializing variables for sending images to the server
var lastSnapshot = Date.now();

// wrap the position in this
function sendCoordinates(canvas, callback) {
    var f = function(event){
			var rect = canvas.getBoundingClientRect();
	    var adjustedPosition = {
	      x: event.clientX - rect.left,
	      y: event.clientY - rect.top
	    };
			callback(adjustedPosition);
		};

		return f;
}

// Run this function when the user clicks the mouse
function startDrawing(event) {
	// Display the click coordinates in the web browser's console
	console.log("Clicked at " + event.x + ", " + event.y);

	// The user began drawing, so save this state to a variable
	isDrawing = true;

	// Save the current timestamp
	lastSent = Date.now();

	// Save the coordinates where user clicked
	prevX = event.x;
	prevY = event.y;
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

function hexToRGB(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    if (alpha === 0 || alpha) {
        return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
    } else {
        return "rgb(" + r + ", " + g + ", " + b + ")";
    }
}


function paint(x,y, brush){
	// draw gradient at x,y
	console.log('transparency:' + brush.transparency);
	
	var width = brush.size * (1 + 2*(1-brush.transparency));
	if (width == 0) {
		width = 10;
	}
	var radgrad = pen.createRadialGradient(
		x,y,width/2,x,y,width);
	
	radgrad.addColorStop(0, hexToRGB(brush.color, brush.transparency));
	radgrad.addColorStop(0.33, hexToRGB(brush.color, brush.transparency * 0.5));
	radgrad.addColorStop(0.66, hexToRGB(brush.color, brush.transparency * 0.2));
	radgrad.addColorStop(1, hexToRGB(brush.color, 0));

	pen.fillStyle = radgrad;
	pen.fillRect(x-width, y-width, 2* width, 2*width);
}

function getCurrentBrush(){
	var brush = {
		size: brush_size,
		transparency: brush_transparency,
		color: brush_color
	};

	return brush;
}

function marchPaint(p1, p2, brush=null){
	var dist = distanceBetween(p1, p2);
	var angle = angleBetween(p1, p2);
	if (brush == null){
		brush = getCurrentBrush();
	}

	// step forward by 5 pixels when adding points
	var x,y;
	for(var t=0; t<dist; t+=5){
	    x = p1.x + (Math.sin(angle) * t);
	    y = p1.y + (Math.cos(angle) * t);
			paint(x,y, brush);
	}
}

// Run this function when the user moves the mouse
function drawStuff(event) {
	// If the user is holding down the mouse button (isDrawing) AND it's been more than 30 milliseconds since we notified the server
	if (isDrawing && Date.now() - lastSent > 30) {

		// paint the new stuff
		var newX = event.x;
		var newY = event.y;

	  	marchPaint({
			x: prevX,
			y: prevY
		},{
			x: newX,
			y: newY
		})

		// tell the server what's going on
		sendImage()

		// Update lastSent to the current timestamp
		lastSent = Date.now();

		// Send message named "new line" to the server with an object containing previous and current coordinates
		socket.emit('draw', {fromX: prevX, fromY: prevY, toX: newX, toY: newY, brush_transparency: brush_transparency, brush_size: brush_size, color: brush_color, uid: uid});

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
	console.log("Stop: " + event.x + ", " + event.y);
}


function redrawPoints(points){

	// this function will be called after the background image is loaded
	var drawRealPoints = function (){
		for(var i=0;i<points.length;i++){

			// draw dots for every point
			var point = points[i];
			marchPaint({
				x: point.fromX,
				y: point.fromY
			}, {
				x: point.toX,
				y: point.toY
			}, {
				size: point.brush_size,
				transparency: point.brush_transparency,
				color: point.color
			});
		}
	};

	// clear the canvas
	pen.clearRect(0, 0, pen.canvas.width, pen.canvas.height);
	drawBase(callback=drawRealPoints);
	
}

socket.on('connect', function(){
	console.log("Robot 1, reporting for duty!");
});

socket.on('new data', function(data){
	console.log("received data from other clients!");
	console.log(data);
	redrawPoints(data);
});

socket.on('draw', function(data){
	var point = data;
	// incremental updates detect if it's the same user
	if (point.uid != uid){
		marchPaint({
			x: point.fromX,
			y: point.fromY
		}, {
			x: point.toX,
			y: point.toY
		}, {
			size: point.brush_size,
			transparency: point.brush_transparency,
			color: point.color
		});
	}
})



/*
*
*		Canvas on the right
*
*/

var myCanvas = document.getElementById('mycanvas2');
var ctx = myCanvas.getContext('2d');

var showResult = true;
var imgResult = new Image;
var imgOriginal = new Image;

imgResult.onload = function(){
	if(showResult){
		ctx.drawImage(imgResult,0,0);
	}
}

imgOriginal.onload = function(){
	if(!showResult){
		ctx.drawImage(imgOriginal,0,0);
	}
}

function redrawResult(){
	if(showResult){
		ctx.drawImage(imgResult,0,0);
	}else{
		ctx.drawImage(imgOriginal,0,0);
	}
}

socket.on('result', function(data){
	imgResult.src = data;
	redrawResult();
})

socket.on('original', function(data){
	imgOriginal.src = data;
	redrawResult();

})



/*
*
*		Buttons
*
*/

var toggle = document.getElementById('toggle_button');
toggle.onclick = function(event){
	showResult = !showResult;

	redrawResult();

	if(showResult){
		console.log("Showing result");
	}else{
		console.log("Showing transform net inputs");
	}
}

var undo = document.getElementById('undo_button');
undo.onclick = function(event){
	socket.emit('undo', {uid: uid});
}

var clear = document.getElementById('clear_button');
clear.onclick = function(event){
	socket.emit('clear');

	// clear my screen
	redrawPoints([]);

	// tell the server what's going on
	sendImage();
}


/*
*
*		Sending the image
*
*/

// this is rate limiting. in the future, we want to send a LOT of image, and get them back faster!
var p = document.getElementById('status');
var current_id = 0;
var server_ack = 0;
socket.on('ack', function(data){
	// server ack is now user-specific
	if(data.uid == uid){
		server_ack = data['i'] + 1;
	}
})

var comms = "";
socket.on('trivia', function(msg){
	console.log(msg);
	comms = msg;
	p.innerHTML = "Latest News: " + comms;
})

var THRESHOLD = 50;
function sendImage(){
	if (Date.now() - lastSnapshot > THRESHOLD && (server_ack >= current_id)){
		console.log('sending data! -----> ')
		var data = canvas.toDataURL('image/png');
		socket.emit('image', {
			'image': data,
			'image_id': current_id,
			'uid': uid
		});

		lastSnapshot = Date.now();
		current_id += 1;
		console.log("Sent:" + current_id + ", Processed:" + server_ack);
	}
}

// check last sent image
setInterval(sendImage, 100);


/*
*
*		Sending the change in styles
*
*/
function changeStyle(style){
	active_elems = document.getElementsByClassName("active")
	for (var i = 0; i < active_elems.length; i++) {
		active_elems[i].classList.remove("active")
	}
	style.classList.add("active")
	socket.emit('change_style', {
		'style_name': style.id
	});
	console.log("Changing the style to " + style.id);
}
