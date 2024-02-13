const textInputs = [];
const log = document.getElementById("values");
let gameCanvas;
let connected = false;
let typingUsername = "";
let userMessage = "";
let username = "";
let userPlayer;
let startTime = 0;
let beginTime = 0;
const fps = 10;
const fpms = 1000/fps;
let frameHist = []
let ctx;

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
            this.textButton.addEventListener("click", () => {this.sendText()});

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
    posX;
    posY;
    speechBubbles = [];

    constructor(posX, posY) {
        this.posX = posX;
        this.posY = posY;
    }

    sayMessage(message) {
        var newBubble = new SpeechBubble(message);
        this.speechBubbles.unshift(newBubble);
        //drawText(50, 50, newBubble.message);
    }

    drawSpeechBubbles() {
        var curBubble;
        
        for (let i = 0; i < this.speechBubbles.length; i++) {
            
            curBubble = this.speechBubbles[i];
            if (curBubble.isOld()) {
                this.speechBubbles.splice(i,i);
            } else {

                //Centering the bubble and making sure the bubbles aren't on top of eachother
                var bubbleCenterX = this.posX+(this.constructor.playerSizeX/2);
                var bubbleCenterY = this.posY-((this.constructor.playerSizeY*0.25)  +(30*i));
                
                curBubble.drawBubble(bubbleCenterX, bubbleCenterY);

            }
        }
    }

    drawPlayer() {
        ctx.fillRect(this.posX, this.posY, this.constructor.playerSizeX, this.constructor.playerSizeY);
    }
}

class SpeechBubble {
    static font = "30px Arial";
    static fontHeight = 30;
    static lifeTime = 5000;
    static maxWidth = 200;
    message;
    spawnTime;
    deathTime;

    constructor (message) {
        this.spawnTime = Date.now();
        this.deathTime = this.spawnTime+this.constructor.lifeTime;
        if (ctx.measureText(message) < this.constructor.maxWidth) {
            this.message[0] = message;
        } else {
            let words = message.split(" ");
            let lines = [];
            let currentLine = words[0];

            for (var i = 1; i < words.length; i++) {
                var word = words[i];
                var width = ctx.measureText(currentLine + " " + word).width;
                if (width < this.constructor.maxWidth) {
                    currentLine += " " + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }

            lines.push(currentLine);

            this.message = lines;
        }
    }

    isOld() {
        return (Date.now() > this.deathTime);
    }

    drawBubble(posX, posY) {
        var prevAlign = ctx.textAlign;
        var prevFont = ctx.font;
        ctx.textAlign = 'center';
        ctx.font = this.constructor.font;
        //Test string: Howdy hi hello how are we today friends?
        for (let i = 0; i < this.message.length; i++) {
            ctx.fillText(this.message[i], posX, posY-(this.constructor.fontHeight*(this.message.length-(1+i))));
        } //Issue with this implementation, boxes will overlap, move bubbles in player class

        ctx.textAlign = prevAlign;
        ctx.font = prevFont;
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
        
        addCanvas();
        drawText(100, 100, "Connecting...");
    }

});

function connect() {
    userPlayer = new Player(250, 250);
    startAnimating();
    connected = true;
}

function sendMessage(msg, textbox) {
    if (msg.length > 0) {
        log.textContent += username+" "+msg+"\n";
        textbox.clearTextbox();
        if (connected) {
            userPlayer.sayMessage(msg);
        }
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
            
            connect();
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
    ctx = gameCanvas.getContext("2d");
    document.getElementById("gameSpace").appendChild(canvas);
}

function drawText(x, y, msg) {
    ctx.font = "30px Arial";
    ctx.fillText(msg, x, y);
}

function updateFPSGraph (newFrame, timestamp) {
    frameHist.push(frameLength);
    drawFPSGraph(0, 0, 500, 200, 6);
}

function drawFPSGraph (x, y, w, h, scale) {

    //Bottom line
    var prevColor = ctx.fillStyle;
    ctx.fillStyle = "00ff00";
    ctx.beginPath();
    ctx.moveTo(x, h+y);
    ctx.lineTo(x+w, h+y);
    ctx.stroke();

    //Target line
    prevColor = ctx.fillStyle;
    ctx.fillStyle = "#FFA500";
    ctx.beginPath();
    var targetFrameH = 0.2*h;
    ctx.moveTo(x, targetFrameH+y);
    ctx.lineTo(x+w, targetFrameH+y);
    ctx.stroke();
    
    //Measured line
    ctx.fillStyle = "#000000";
    ctx.beginPath(); // Start a new path
    ctx.moveTo(x, ((frameHist[frameHist.length-1]/fpms)*h)+y); // Move the pen to leftmost at the frame percentage
    for (let i = 0; i < frameHist.length && (i+1)*scale < w; i++) {
        var posY = 1-((((frameHist[frameHist.length-(i+1)]/(fpms))))*0.8);
        ctx.lineTo(x+(i*scale), (posY*h)+y); // Draw a line to previous frame interval
        ctx.stroke(); // Render the path
    }
    
}

function startAnimating() {
    startTime = Date.now(); 
    drawScreen();
}

function drawScreen() {
    beginTime = Date.now();
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    userPlayer.drawPlayer(gameCanvas);
    userPlayer.drawSpeechBubbles(gameCanvas);
    var fpsDecimalPlaces = 1;
    var measuredFPS = (Math.floor((1000/(Date.now()-startTime))*(fpsDecimalPlaces*10)))/(fpsDecimalPlaces*10);
    drawText(25, 25, "FPS: "+measuredFPS);
    
    startTime = Date.now();
    
    frameLength = Math.min(fpms-(Date.now()-beginTime),fpms);
    updateFPSGraph(measuredFPS, beginTime);
    setTimeout(() => {
        requestAnimationFrame(drawScreen);
    }, fpms);
    
    
}