var canvas;
var canvasContext;
const MIN_WIDTH = 200;

var buttonImg = new Image();
buttonImg.src = "images/Button-Red.png";
var flippedImg = new Image();
flippedImg.src = "images/Button-Red-Flipped.png";
var isPressed = false;
var buttonRadius = 200; //default
const buttonRatio = 5;

var confetti = [];
var confettiSize = 10; //default
var confettiRatio = 10;
var CONFETTI_DENSITY = 0.05; //0 = no confetti, 1 = all confetti
const COLORS = ["red", "yellow", "blue"];

var score = 359;
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

	resizeCanvas();
};
window.onresize = resizeCanvas;

function resizeCanvas() {
	if (window.innerWidth !== canvas.width) {
		canvas.width = window.innerWidth;
		canvas.height = window.innerWidth;
	}
	if (window.innerHeight < canvas.height) {
		canvas.width = window.innerHeight;
		canvas.height = window.innerHeight;
	}
	if (canvas.width < MIN_WIDTH) {
		canvas.width = MIN_WIDTH;
		canvas.height = MIN_WIDTH;
	}

	buttonRadius = Math.ceil(canvas.width / buttonRatio);
	confettiSize = Math.ceil(buttonRadius / confettiRatio);
}

function drawEverything() {
	canvasContext.fillStyle = 'white';
	canvasContext.fillRect(0,0, canvas.width,canvas.height);
	//canvasContext.strokeRect(0,0, canvas.width,canvas.height);
	drawButton();
	var pointSize = Math.ceil(buttonRadius * (2/3));
	drawLetter(pointSize);
	drawCaption(pointSize);
	if (score >= WINNING_SCORE) {
		drawConfetti();
	}
}

function drawButton() {
	var button = isPressed ? flippedImg : buttonImg;
	var buttonPosition = {x: canvas.width/2 - buttonRadius,
												y: canvas.height/2 - buttonRadius};
	canvasContext.drawImage(button, buttonPosition.x,buttonPosition.y,
																	buttonRadius*2,buttonRadius*2);
}

function drawLetter(pointSize) {
	canvasContext.fillStyle = 'black';
	canvasContext.textBaseline = 'middle';
	canvasContext.textAlign = 'center';
	canvasContext.font = 'normal ' + pointSize + 'pt monospace';
	var textPosition = {x: canvas.width / 2 + (isPressed ? 2 : 0),
											y: canvas.height /2 + (isPressed ? 2 : 0)};
	canvasContext.fillText("A", textPosition.x, textPosition.y);
}

function drawCaption(pointSize) {
	canvasContext.font = 'normal ' + Math.ceil(pointSize / 4) + 'pt monospace';
	var buffer = canvas.width / 20;
	var captionPosition = {x: canvas.width / 2,
												 y: canvas.height / 2 + buttonRadius + buffer};
	canvasContext.fillText(getCaption(score), captionPosition.x,
																						captionPosition.y);
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

function drawConfetti() {
	if (Math.random() < CONFETTI_DENSITY) {
		console.log("adding new confetti");
		var newConfetti = {
			xPos: randInt(canvas.width),
			yPos: -confettiSize,
			color: COLORS[randInt(COLORS.length)],
			ySpeed: Math.random() * 1.5 + 0.75
		};
		confetti.push(newConfetti);
	}
	confetti.forEach((confetto) => {
		drawSquare(confetto.xPos, confetto.yPos,
							 confettiSize,
							 confetto.color);
		confetto.yPos += confetto.ySpeed;
	});
	// var pos = {x: 50, y: 50};
	// drawSquare(pos, confettiSize, "red");
	console.log(confetti);
	if (confetti.length > 0) {
		console.log(confetti[0].yPos);
		console.log(confettiSize);
		console.log(canvas.height);
	}
	while (confetti.length > 0
				 && (confetti[0].yPos - confettiSize) > canvas.height) {
		confetti.shift();
		console.log("confetti deleted!");
	}
}

function drawSquare(xPos, yPos, size, color) { //TODO: add rotation
	canvasContext.fillStyle = color;
	// var square = new Path2D();
	// square.moveTo(position.x, position.y);
	// square.lineTo(position.x + size, position.y);
	// square.lineTo(position.x + size, position.y + size);
	// square.lineTo(position.x, position.y + size);
	// square.closePath();
	// canvasContext.fill(square);
	canvasContext.rect(xPos, yPos, size, size);
	//canvasContext.fill();
	canvasContext.strokeRect(xPos, yPos, size, size);
}

function randInt(upper, lower = 0) {
	if (upper > lower) {
		var range = upper - lower;
		return Math.floor(Math.random() * range) + lower;
	}
	return 0;
}
