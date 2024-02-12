const textInputs = [];
const log = document.getElementById("values");
let gameCanvas;
let connected = false;
let typingUsername = "";
let message = "";
let username = "<User>";

class TextInput {
    
	textInput;
	textButton;
	textDiv;
	sendFunction;
    static textInputs = [];

    constructor(div, placeholder, func, hasButton, reqConnection) {
		this.sendFunction = func;
        
        this.textDiv = div;
        this.textDiv.setAttribute("class", "inputDiv");
        
        this.textInput = document.createElement("input");
        this.textInput.setAttribute("placeholder", placeholder);
        this.textInput.setAttribute("class", "inputText");
		this.textInput.addEventListener("keyup", () => {this.updateText(event)});

        this.textDiv.append(this.textInput);
        
        if (hasButton) {
            this.textButton = document.createElement("button");
            this.textButton.setAttribute("class", "inputButton");
			this.textButton.setAttribute("onclick", this.sendText);

            this.textButton.textContent = "🠊";
            this.textDiv.append(this.textButton);
        }
        
        this.constructor.textInputs.push(this);
    }

	updateText(e) {
		if (e.key=="Enter") {
			this.sendText();
		}
	}

	sendText() {
		if (this.textInput.value.length > 0) {
			eval(this.sendFunction+"(this.textInput.value, this)");
		}
	}

	clearTextbox() {
		this.textInput.value = "";
	}

    setDisabled(state) {
        if (state) {
            this.textInput.setAttribute("disabled", true);
            this.textButton.setAttribute("disabled", true);
        } else {
            this.textInput.removeAttribute("disabled");
            this.textButton.removeAttribute("disabled");
        }
    }

    static findInputByID(id) {
        return textInputs.find((element) => element.textDiv.getAttribute("id")==id);
    }
}

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
        const foundInputs = document.getElementsByClassName("inputDiv");
        for (let i = 0; i < foundInputs.length; i++) {
			let tI = new TextInput(
                foundInputs[i],
                foundInputs[i].getAttribute("placeholder"),
                foundInputs[i].getAttribute("func"),
                foundInputs[i].getAttribute("hasButton"),
                foundInputs[i].getAttribute("reqConnection")
            );
            textInputs.push(tI);
        }

        let chatInput = TextInput.findInputByID("chatInput");
        chatInput.setDisabled(true);
    }

});

function sendMessage(msg, textbox) {
    if (msg.length > 0) {
        log.textContent += username+" "+msg+"\n";
        textbox.clearTextbox();
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

function setUser(usr, textbox) {
    if (!connected) {
        if (usr.length > 0) {
            username = "<"+usr+">";
            recieveMessage("Username set to "+username);
            textbox.setDisabled(true);
            TextInput.findInputByID("chatInput").setDisabled(false);
            connected = true;

            const testPlayer = new Player(200, 200);
            //testPlayer.drawPlayer(gameCanvas);
            //testPlayer.drawText(gameCanvas, "Hello");
        }
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