var canvas;
var canvasContext;

var buttonImg = new Image();
buttonImg.src = "images/Button-Red.png";
var flippedImg = new Image();
flippedImg.src = "images/Button-Red-Flipped.png";
var isPressed = false;
var buttonRadius = 300;

var score = 0;
const WINNING_SCORE = 360;

/*var ballX = 300;
var ballY = 350;
var ballSpeedX = 10;
var ballSpeedY = 0;
var ballMissed = false;
const BALL_RADIUS = 10;

var playerScore = 0;
var computerScore = 0;
var playerScoredLast;
//const WINNING_SCORE = 1;

var showingStartScreen = true;
var showingWinScreen = false;

var leftPaddleY = 300;
var rightPaddleY = 300;
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 10;
const PADDLE_GAP = 208;

var computerSpeed = 0;
var computerMaxSpeed = 7;
var computerAccel = 0.5;
const COMPUTER_MOVE_BUFFER = 35;

var isMuted = false;
var isPaused = false;
const MUTE_POS = {x:50, y:580};
const PAUSE_POS = {x:980, y:580};

var bonkSnd = new Audio("bonk.mp3");
var whiffSnd = new Audio("whiff.mp3");
var yussSnd = new Audio("yuss.mp3");
var awwSnd = new Audio("aww.mp3");
var allSounds = [bonkSnd, whiffSnd, yussSnd, awwSnd];

var coffeeImg = new Image();
coffeeImg.src = "images/computer_coffee.png";
var sleepImg = new Image();
sleepImg.src = "images/computer_sleep.png";
var playerReadyImg = new Image();
playerReadyImg.src = "images/player_ready.png";
var playerHitImg = new Image();
playerHitImg.src = "images/player_hit.png";
var computerReadyImg = new Image();
computerReadyImg.src = "images/computer_ready.png";
var computerHitImg = new Image();
computerHitImg.src = "images/computer_hit.png";

var playerTimer = 0;
var computerTimer = 0;
const ANIMATE_LENGTH = 15;*/

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

function handleMouseClick(evt) {
	var pos = calculateMousePos(evt);
	//TODO: if mouse is in button, press button
	if (pos.x > MUTE_POS.x && pos.x < MUTE_POS.x+80 &&
		pos.y < MUTE_POS.y && pos.y > MUTE_POS.y-20) {
			pressButton();
	}
}

function handleMouseUp(evt) {
	releaseButton();
}

function handleKeyDown(evt) {
	console.log("In handleKeyDown");
	if (evt.keyCode === 27) { //esc
		//TODO: show confirmation dialog
		score = 0;
	}
	if (evt.keyCode === 65) {
		console.log("Pressing button");
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
	console.log("Adding keydown event listener");
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
	var button = isPressed ? flippedImg : buttonImg;
	var buttonPosition = {x: canvas.width/2 - buttonRadius,
												y: canvas.height/2 - buttonRadius};
	canvasContext.drawImage(button, buttonPosition.x,buttonPosition.y,
																	buttonRadius,buttonRadius);
	canvasContext.fillStyle = 'black';
	canvasContext.textBaseline = 'middle';
	canvasContext.textAlign = 'center';
	canvasContext.font = 'normal 200pt monospace';
	canvasContext.fillText("A", canvas.width/2,canvas.height/2);
}
