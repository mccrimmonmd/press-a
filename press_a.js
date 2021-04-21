var canvas;
var canvasContext;

var buttonImg = new Image();
buttonImg.src = "images/Button-Red.png";
var flippedImg = new Image();
flippedImg.src = "images/Button-Red-Flipped.png";
var isPressed = false;
var buttonRadius = 200;

var score = 0;
const WINNING_SCORE = 360;

function calculateMousePos(evt) {
	var rect = canvas.getBoundingClientRect();
	var root = document.documentElement;
	var mouseX = evt.clientX - rect.left - root.scrollLeft;
	var mouseY = evt.clientY - rect.top - root.scrollTop;
	return {
		x:mouseX,
		y:mouseY
	};
}

function distanceFromButton(pos) {
	var a = Math.abs(pos.x - canvas.width/2);
	var b = Math.abs(pos.y - canvas.height/2);
	return Math.sqrt(a*a + b*b);
}

function handleMouseClick(evt) {
	var pos = calculateMousePos(evt);
	var dist = distanceFromButton(pos);
	console.log(dist);
	if (dist <= buttonRadius) {
			pressButton();
	}
}

function handleMouseUp(evt) {
	releaseButton();
}

function handleKeyDown(evt) {
	if (evt.keyCode === 27) { //esc
		//TODO: show confirmation dialog
		score = 0;
	}
	if (evt.keyCode === 65) {
		pressButton();
	}
}

function handleKeyUp(evt) {
	if (evt.keyCode === 65) {
		releaseButton();
	}
}

function pressButton() {
	if (score < WINNING_SCORE) {
		isPressed = true;
		score += 1;
	}
}

function releaseButton() {
	isPressed = false;
}

window.onload = function() {
	canvas = document.getElementById('gameCanvas');
	canvasContext = canvas.getContext('2d');

	var framesPerSecond = 30;
	setInterval( function() {
		//moveEverything();
		drawEverything();
	}, 1000/framesPerSecond );

	canvas.addEventListener('mousedown', handleMouseClick);
	canvas.addEventListener('mouseup', handleMouseUp);
	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('keyup', handleKeyUp);
};

function colorCircle(centerX,centerY, radius, drawColor) {
	canvasContext.fillStyle = drawColor;
	canvasContext.beginPath();
	canvasContext.arc(centerX,centerY, radius, 0,Math.PI*2, true);
	canvasContext.fill();
}

function colorRect(leftX,topY, width,height, drawColor) {
	canvasContext.fillStyle = drawColor;
	canvasContext.fillRect(leftX,topY, width,height);
}

function drawEverything() {
	colorRect(0,0, canvas.width,canvas.height, 'white');
	//canvasContext.strokeRect(0,0, canvas.width,canvas.height);
	var button = isPressed ? flippedImg : buttonImg;
	var buttonPosition = {x: canvas.width/2 - buttonRadius,
												y: canvas.height/2 - buttonRadius};
	canvasContext.drawImage(button, buttonPosition.x,buttonPosition.y,
																	buttonRadius*2,buttonRadius*2);
	canvasContext.fillStyle = 'black';
	canvasContext.textBaseline = 'middle';
	canvasContext.textAlign = 'center';
	var pointSize = Math.ceil(buttonRadius * (2/3));
	canvasContext.font = 'normal ' + pointSize + 'pt monospace';
	var textPosition = {x: canvas.width / 2 + (isPressed ? 2 : 0),
											y: canvas.height /2 + (isPressed ? 2 : 0)};
	canvasContext.fillText("A", textPosition.x, textPosition.y);
	canvasContext.font = 'normal ' + Math.ceil(pointSize / 4) + 'pt monospace';
	var captionPosition = {x: canvas.width / 2,
												 y: canvas.height / 2 + buttonRadius + 50};
	canvasContext.fillText(getCaption(score), captionPosition.x, captionPosition.y);
}

function getCaption(currentScore) {
	if (currentScore === 0) return "Press 'A' to win!";
	else if (currentScore < 20) return "That's it! Keep going!";
	else if (currentScore < 50) return "You're doing great!";
	else if (currentScore < 100) return "You're gonna win so hard!";
	else if (currentScore < 150) return "Faster! Faster!";
	else if (currentScore < 200) return "Keep going! Don't give up!";
	else if (currentScore < 265) return "Almost there!";
	else if (currentScore < WINNING_SCORE) return "Soooo close!";
	else return "CONGRATULATIONS! YOU WIN!!!";
}
