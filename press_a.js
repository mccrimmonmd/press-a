let canvas;
let canvasContext;
const MIN_WIDTH = 200;

let buttonImg = new Image();
buttonImg.src = "images/Button-Red.png";
let flippedImg = new Image();
flippedImg.src = "images/Button-Red-Flipped.png";
let isPressed = false;
let buttonRadius = 200; //default
const buttonRatio = 5;

let confetti = [];
let confettiSize = 10; //default
let confettiRatio = 10;
let CONFETTI_DENSITY = 0.25; //0 = no confetti, 1 = max confetti
let DRIFT_RATIO = 10;
const COLORS = ["cyan", "magenta", "yellow", "red",  "blue", "green"]; //, "purple"

let score = 359;
const WINNING_SCORE = 360;

function calculateMousePos(evt) {
	let rect = canvas.getBoundingClientRect();
	let root = document.documentElement;
	let mouseX = evt.clientX - rect.left - root.scrollLeft;
	let mouseY = evt.clientY - rect.top - root.scrollTop;
	return {
		x:mouseX,
		y:mouseY
	};
}

function distanceFromButton(pos) {
	let a = Math.abs(pos.x - canvas.width/2);
	let b = Math.abs(pos.y - canvas.height/2);
	return Math.sqrt(a*a + b*b);
}

function handleMouseClick(evt) {
	let pos = calculateMousePos(evt);
	let dist = distanceFromButton(pos);
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
	  confetti = [];
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

	let framesPerSecond = 30;
	setInterval( function() {
		drawEverything();
	}, 1000/framesPerSecond );

	canvas.addEventListener('mousedown', handleMouseClick);
	canvas.addEventListener('mouseup', handleMouseUp);
	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('keyup', handleKeyUp);

	resizeCanvas();
};
window.onresize = resizeCanvas;

function resizeCanvas() { //TODO: don't restrict to square
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
	canvasContext.clearRect(0,0, canvas.width,canvas.height);
	//canvasContext.strokeRect(0,0, canvas.width,canvas.height);
	drawButton();
	let pointSize = Math.ceil(buttonRadius * (2/3));
	drawLetter(pointSize);
	drawCaption(pointSize);
	if (score >= WINNING_SCORE) {
		drawConfetti();
	}
}

function drawButton() {
	let button = isPressed ? flippedImg : buttonImg;
	let buttonPosition = {x: canvas.width/2 - buttonRadius,
												y: canvas.height/2 - buttonRadius};
	canvasContext.drawImage(button, buttonPosition.x,buttonPosition.y,
																	buttonRadius*2,buttonRadius*2);
}

function drawLetter(pointSize) {
	canvasContext.fillStyle = 'black';
	canvasContext.textBaseline = 'middle';
	canvasContext.textAlign = 'center';
	canvasContext.font = 'normal ' + pointSize + 'pt monospace';
	let textPosition = {x: canvas.width / 2 + (isPressed ? 2 : 0),
											y: canvas.height /2 + (isPressed ? 2 : 0)};
	canvasContext.fillText("A", textPosition.x, textPosition.y);
}

function drawCaption(pointSize) {
	canvasContext.fillStyle = 'black';
	canvasContext.textBaseline = 'middle';
	canvasContext.textAlign = 'center';
	canvasContext.font = 'normal ' + Math.ceil(pointSize / 4) + 'pt monospace';
	let buffer = canvas.width / 20;
	let captionPosition = {x: canvas.width / 2,
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
		let newConfetti = {
			xPos: randNum(canvas.width),
			yPos: -confettiSize,
			color: COLORS[randInt(COLORS.length)],
			yVel: Math.random() * 1.5 + 0.75,
			xVel: randInt(-10, 10),
			percentRotated: randInt(25),
			rotVel: randInt(-3, 3)
		};
		confetti.push(newConfetti);
	}
	confetti.forEach((confetto) => {
		drawSquare(confetto.xPos, confetto.yPos,
							 confettiSize,
							 confetto.color,
						   confetto.percentRotated);
	  animateConfetti(confetto);
	});
	let toDelete = [];
	confetti.forEach((confetto, index) => {
		if (confetto.yPos - confettiSize > canvas.height) {
			toDelete.push(index);
		}
	});
	toDelete.forEach((pos, index) => {
		confetti.splice(pos - index, 1);
	});
}

function drawSquare(xPos, yPos, size, color, twisted = 0) {
	canvasContext.fillStyle = color;
	canvasContext.strokeStyle = "black";
	let points = rotateSquareAt(xPos, yPos, size, twisted/100);
	let square = new Path2D();
	square.moveTo(points[0].x, points[0].y);
	square.lineTo(points[1].x, points[1].y);
	square.lineTo(points[2].x, points[2].y);
	square.lineTo(points[3].x, points[3].y);
	square.closePath();
	canvasContext.fill(square);
	canvasContext.stroke(square);
}

function rotateSquareAt(xPos, yPos, size, angle) {
	let offset = {
		x: {max: xPos + (size / 2), min: xPos - (size / 2)},
		y: {max: yPos + (size / 2), min: yPos - (size / 2)}
	};
	let translated = [
		{x:xPos - offset.x.max, y:yPos - offset.y.max},
		{x:xPos - offset.x.min, y:yPos - offset.y.max},
		{x:xPos - offset.x.min, y:yPos - offset.y.min},
		{x:xPos - offset.x.max, y:yPos - offset.y.min}
	];
	let radians =  2 * Math.PI * angle;
	let cos = Math.cos(radians);
	let sin = Math.sin(radians);
	let rotated = translated.map(point => ({
		x: point.x * cos - point.y * sin,
		y: point.y * cos + point.x * sin
	}));
	return rotated.map(point => ({
		x:point.x + offset.x.max,
		y:point.y + offset.y.max
	}));
}

function animateConfetti(confetto) {
	confetto.percentRotated += confetto.rotVel;
	confetto.percentRotated %= 100;

	let drift = confetto.xVel;
	// confetto.yVel = Math.abs(drift === 0 ? 0 : 1/drift) * 2 + 1;
	confetto.yPos += confetto.yVel;
	confetto.xPos += drift / DRIFT_RATIO;

	//poor man's sine wave--I came up with this myself, apparently??
	if (drift % 2 === 0) {
		if (drift < 20) {
			confetto.xVel += 2;
		}
		else {
			confetto.xVel = 21;
		}
	}
	else {
		if (drift > -21) {
			confetto.xVel -= 2;
		}
		else {
			confetto.xVel = -20;
		}
	}
}

function randNum(bound, upperBound = null) {
	let lowerBound;
	if (upperBound === null) {
		upperBound = bound;
		lowerBound = 0;
	}
	else {
		lowerBound = bound;
	}

	if (lowerBound <= upperBound) {
		let range = upperBound - lowerBound;
		return Math.random() * range + lowerBound;
	}
	else {
		return 0;
	}
}

function randInt(bound, upperBound = null) {
	return Math.floor(randNum(bound, upperBound));
}
