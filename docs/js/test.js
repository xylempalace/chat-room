const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");
const usernameInput = document.getElementById("usernameInput");
const usernameSend = document.getElementById("usernameSend");
const log = document.getElementById("values");
let gameCanvas;
let connected = false;
let typingUsername = "";
let message = "";
let username = "<User>";

chatInput.addEventListener("input", updateValue);
chatInput.addEventListener("keyup", updateValue);

usernameInput.addEventListener("input", updateUser);
usernameInput.addEventListener("keyup", updateUser);

setDisabled(chatInput, !connected);
setDisabled(chatSend, !connected);
setDisabled(usernameInput, connected);
setDisabled(usernameSend, connected);

class Player {

	static playerSizeX = 100;
	static playerSizeY = 100;

	constructor(posX, posY) {
		this.posX = posX;
		this.posY = posY;
	}

	drawText(cnv, message) {
		var ctx = cnv.getContext("2d");
		ctx.font = "30px Arial";
		ctx.fillText(message, posX, posY+10);
	}

	drawPlayer(cnv) {
		var ctx = cnv.getContext("2d");
		ctx.fillRect(posX, posY, playerSizeX, playerSizeY);
	}
}

document.addEventListener("readystatechange", (e) => {
	if (e.target.readyState === "complete") {
		updateInputAttributes();
	}
});

function updateValue(e) {
	if (e.key=="Enter") {
        sendMessage();
    }
    message = e.target.value;
}

function clearMessage() {
	chatInput.value = "";
	message = "";
}

function sendMessage() {
	if (message.length > 0) {
		log.textContent += username+" "+message+"\n";
		clearMessage();
	}
}

function printMessage(msg) {
	log.textContent += msg+"\n";
}

function recieveMessage(msg) {
	log.textContent += msg+"\n";
}

function updateUser(e) {
	if (e.key=="Enter") {
        setUser();
    }
    typingUsername = e.target.value;
}

function setUser() {
	if (!connected) {
		username = "<"+usernameInput.value+">";
		recieveMessage("Username set to "+username);
		connected = true;
		setDisabled(chatInput, !connected);
		setDisabled(chatSend, !connected);
		setDisabled(usernameInput, connected);
		setDisabled(usernameSend, connected);
		addCanvas();

		const testPlayer = Player(200, 200);
		testPlayer.drawPlayer(canvas);
		testPlayer.drawText(canvas, "Hello");
	}
}

function setDisabled(element, state) {
	if (state) {
		element.setAttribute("disabled", true);
	} else {
		element.removeAttribute("disabled");
	}
}

function addCanvas() {
	var canvas = document.createElement('canvas');
	canvas.id     = "gameCanvas";
	canvas.width  = document.getElementById('gameSpace').clientWidth*0.8;
	canvas.height = document.getElementById('gameSpace').clientHeight;
	canvas.style.zIndex = 8;
	canvas.style.position = "absolute";
	canvas.style.border = "1px solid";
	canvas.style.borderColor = "black";
	gameCanvas = canvas;
	document.getElementById("gameSpace").appendChild(canvas);
}

function addSquare(x, y, w, h) {
	var c = document.getElementById("gameCanvas");
	var ctx = c.getContext("2d");
	ctx.font = "30px Arial";
	ctx.fillText("Hello World", 10, 50);
}

