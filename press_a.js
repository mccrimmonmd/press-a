let canvas;
let canvasContext;

const COLORS = ["cyan", "magenta", "yellow", "red",  "blue", "green"]; //, "purple"
const config = {
	minWidth: 500,
	buttonRatio: 5,
	confettiRatio: 10,
	confettiDensity: 0.25, //n = 0 = no confetti, >1 = n per frame
	driftRatio: 10,
	winningScore: 360,
	framesPerSecond: 30,
	cannonSpreadMin: 10,
	cannonSpreadMax: 55, //function of width?
	cannonSpeedMin: 5,
	cannonSpeedMax: 30,
	cannonDensityMultiplier: 300
};

let score = 0;

let confetti = [];
let confettiSize = 10; //default

let buttonImg = new Image();
buttonImg.src = "images/Button-Red.png";
let flippedImg = new Image();
flippedImg.src = "images/Button-Red-Flipped.png";

let isPressed = false;
let pressedByMouse = false;
let buttonRadius = 200; //default

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
	if (!isPressed && dist <= buttonRadius) {
		pressedByMouse = true;
		pressButton();
	}
}

function handleMouseUp(evt) {
	if (pressedByMouse) {
		pressedByMouse = false;
		releaseButton();
	}
}

function handleKeyDown(evt) {
	if (evt.keyCode === 27) { //esc
		if (confirm("Restart?")) {
			score = 0;
			confetti = [];
		}
	}
	if (!isPressed && evt.keyCode === 65) { //A
		pressButton();
	}
}

function handleKeyUp(evt) {
	if (!pressedByMouse && evt.keyCode === 65) { //A
		releaseButton();
	}
}

function pressButton() {
	if (score < config.winningScore) {
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

	setInterval( function() {
		drawEverything();
	}, 1000/config.framesPerSecond );

	canvas.addEventListener('mousedown', handleMouseClick);
	canvas.addEventListener('mouseup', handleMouseUp);
	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('keyup', handleKeyUp);

	resizeCanvas();
};
window.onresize = resizeCanvas;

function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	if (canvas.width < config.minWidth) {
		canvas.width = config.minWidth;
	}
	if (canvas.height < config.minWidth) {
		canvas.height = config.minWidth;
	}
	let resizeBy = canvas.width < canvas.height ?
		canvas.width :
		canvas.height;
	// TODO: max width?

	buttonRadius = Math.ceil(resizeBy / config.buttonRatio);
	confettiSize = Math.ceil(buttonRadius / config.confettiRatio);
}

function drawEverything() {
	canvasContext.clearRect(0,0, canvas.width,canvas.height);
	drawButton();
	let pointSize = Math.ceil(buttonRadius * (2/3));
	drawLetter(pointSize);
	drawCaption(pointSize);
	if (score >= config.winningScore) {
		drawConfetti();
	}
	// drawDebug(pointSize);
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
											y: canvas.height/ 2 + (isPressed ? 2 : 0)};
	canvasContext.fillText("A", textPosition.x, textPosition.y);
}

function drawCaption(pointSize) {
	canvasContext.fillStyle = 'black';
	canvasContext.textBaseline = 'middle';
	canvasContext.textAlign = 'center';
	canvasContext.font = 'normal ' + Math.ceil(pointSize / 4) + 'pt monospace';
	let buffer = canvas.width / 20;
	let captionPosition = {x: canvas.width / 2,
												 y: canvas.height/ 2 + buttonRadius + buffer};
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
	else if (currentScore < config.winningScore) return "Soooo close!";
	else return "CONGRATULATIONS! YOU WIN!!!";
}

function drawConfetti() {
	let density = config.confettiDensity;
	spawnConfetti(density);
	if (score === config.winningScore) {
		spawnCannonConfetti(density);
		score += 1;
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
		if (confetto.yPos - confettiSize > canvas.height ||
				confetto.xPos + confettiSize < 0) {
			toDelete.push(index);
		}
	});
	toDelete.forEach((pos, index) => {
		confetti.splice(pos - index, 1);
	});
}

function spawnConfetti(density) {
	while (Math.random() < density) {
		let newConfetti = {
			xPos: randNum(canvas.width),
			yPos: -(confettiSize * 2),
			color: COLORS[randInt(COLORS.length)],
			yVel: Math.random() * 1.5 + 0.75,
			xVel: randInt(-10, 10),
			percentRotated: randInt(25),
			rotVel: randInt(-3, 3),
			isCannon: false
		};
		confetti.push(newConfetti);
		density -= 1;
	}
}

function spawnCannonConfetti(density) {
	let numSpawn = Math.ceil(density * config.cannonDensityMultiplier);
	for (let i = 0; i < numSpawn; i++) {
		let leftSpeeds = vectorToSpeeds(getCannonVector("left"));
		let leftConfetti = {
			xPos: -confettiSize,
			yPos: confettiSize + canvas.height,
			color: COLORS[randInt(COLORS.length)],
			xVel: leftSpeeds.dx,
			yVel: leftSpeeds.dy,
			percentRotated: randInt(25),
			rotVel: randInt(-3, 3),
			isCannon: true
		};
		let rightSpeeds = vectorToSpeeds(getCannonVector("right"));
		let rightConfetti = {
			xPos: confettiSize + canvas.width,
			yPos: confettiSize + canvas.height,
			color: COLORS[randInt(COLORS.length)],
			xVel: rightSpeeds.dx,
			yVel: rightSpeeds.dy,
			percentRotated: randInt(25),
			rotVel: randInt(-3, 3),
			isCannon: true
		};
		confetti.push(leftConfetti);
		confetti.push(rightConfetti);
	}
}

function getCannonVector(side) {
	let angle = randNum(config.cannonSpreadMin, config.cannonSpreadMax);
	if (side === "right") {
		angle = -angle;
	}
	angle -= 90;
	let speed = randNum(config.cannonSpeedMin, config.cannonSpeedMax);
	return {angle: angle, r: speed};
}

function vectorToSpeeds(vector) {
	let angle = toRadians(vector.angle);
	let dx = vector.r * Math.cos(angle);
	let dy = vector.r * Math.sin(angle);
	return {dx: dx, dy: dy};
}

function drawDebug() {
	canvasContext.strokeRect(0,0, canvas.width-5,canvas.height-5);
	drawSquare(canvas.width/2, canvas.height/2, 15, "black")
	canvasContext.fillText(score, 20,20);
}

function drawSquare(xPos, yPos, size, color, percentRotated = 0) {
	canvasContext.fillStyle = color;
	canvasContext.strokeStyle = "black";
	let degrees = percentRotated * 3.6;
	let points = rotateSquareAt(xPos, yPos, size, degrees);
	let square = new Path2D();
	square.moveTo(points[0].x, points[0].y);
	square.lineTo(points[1].x, points[1].y);
	square.lineTo(points[2].x, points[2].y);
	square.lineTo(points[3].x, points[3].y);
	square.closePath();
	canvasContext.fill(square);
	canvasContext.stroke(square);
}

function rotateSquareAt(xPos, yPos, size, degrees) {
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
	let radians =  toRadians(degrees);
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

	confetto.yPos += confetto.yVel;
	if (confetto.isCannon) {
		confetto.xPos += confetto.xVel;
		return;
	}
	let drift = confetto.xVel;
	confetto.xPos += drift / config.driftRatio;

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

/* randNum: returns a float in the range [bound, upperBound) or [0, bound) */
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

/* randInt: returns an integer in the range [bound, upperBound] or [0, bound]
 * (INCLUSIVE!) */
function randInt(bound, upperBound = null) {
	upperBound = upperBound === null ? null : upperBound + 1;
	return Math.floor(randNum(bound, upperBound));
}

function toRadians(degrees) {
	return  Math.PI * (degrees/180);
}
