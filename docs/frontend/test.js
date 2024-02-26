//Text info
const textInputs = [];
const log = document.getElementById("values");

//Canvas references
let gameCanvas;
let ctx;

//Client information
let connected = false;
let userPlayer;

//FPS tracking and measurement, debug
let startTime = 0;
let beginTime = 0;
const fps = 30;
const fpms = 1000/fps;
const scriptStart = Date.now();

//Camera properties
let activeCamera;
let cameraList = [];

let otherPlayers = [];

class Vector2 {
    
    x;
    y;
    
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    
    get screenPos() {
        let v = new Vector2(
        (this.x + (activeCamera.width/2)) - activeCamera.pos.x , 
        (this.y + (activeCamera.height/2)) - activeCamera.pos.y
        );
        return v;
    }
    
    get normalized() {
        let a = Math.atan2(this.y, this.x);
        return new Vector2(Math.cos(a), Math.sin(a));
    }

    get toString() {
        return "X: " + truncateNumber(this.x, 1) + "   Y: " + truncateNumber(this.y, 1);
    }

    static get zero() {
        return new Vector2(0,0);
    }

}

class GameObject {
    pos;
    id;

    constructor (id, pos) {
        this.id = id;
        this.pos = pos;
    }

    get x () {return this.pos.x;}
    get y () {return this.pos.y;}

    set x (v) {this.pos.x = v;}
    set y (v) {this.pos.y = v;}
}

let isDark = false;

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

class DebugGraph {
    
    static frameHist = [];
    
    static updateFPSGraph(newData) {
        DebugGraph.frameHist.push(newData);
    }
    
    static drawFPSGraph (x, y, w, h, scale) {

        //Bottom line
        let prevColor = ctx.strokeStyle;
        ctx.strokeStyle = "#AAAAAA";
        ctx.beginPath();
        ctx.moveTo(x, h+y);
        ctx.lineTo(x+w, h+y);
        ctx.stroke();

        //Target line
        ctx.strokeStyle = "#FFA500";
        ctx.beginPath();
        let targetFrameH = 0.2*h;
        ctx.moveTo(x, targetFrameH+y);
        ctx.lineTo(x+w, targetFrameH+y);
        ctx.stroke();
        
        //Measured line
        ctx.strokeStyle = "#000000";
        ctx.beginPath(); // Start a new path
        let posY = 1-((((DebugGraph.frameHist[DebugGraph.frameHist.length-1]/(fpms))))*0.8);
        posY = Math.max(posY, 0);
        posY = Math.min(posY, 1);
        ctx.moveTo(x, (posY*h)+y); // Move the pen to leftmost at the frame percentage
        for (let i = 0; i < DebugGraph.frameHist.length && i*scale < w; i++) {
            posY = 1-((((DebugGraph.frameHist[DebugGraph.frameHist.length-(i+1)]/(fpms))))*0.8);
            posY = Math.max(posY, 0);
            posY = Math.min(posY, 1);
            ctx.lineTo(x+(i*scale), (posY*h)+y); // Draw a line to previous frame interval
            ctx.stroke(); // Render the path
        }
        
        ctx.strokeStyle = prevColor;
    }
}

class Camera extends GameObject {
    moveDist;
    width;
    height;
    id;
    
    halfWidth;
    halfHeight;
    
    constructor(id, pos, mDist, mzh) {
        super("CAMERA-"+id, pos);
    
        if (gameCanvas != null) {
            this.width = gameCanvas.width;
            this.height = gameCanvas.height;
            this.halfWidth = this.width / 2;
            this.halfHeight = this.height / 2;
        }
        
        this.moveDist = mDist * Math.min(this.width, this.height);
        receiveMessage(this.moveDist);
    }
    
    warpTo (pos) {
        this.pos = pos;
    }
    
    follow (pos) {
        let dif = new Vector2(
            pos.x - (this.pos.x),
            pos.y - (this.pos.y)
        );
        
        let sqrHypotenuse = (dif.x * dif.x) + (dif.y * dif.y);
        if (sqrHypotenuse > this.moveDist * this.moveDist) {
            this.x += dif.normalized.x * Math.abs(dif.x/10);
            this.y += dif.normalized.y * Math.abs(dif.y/10);
        }
    }
    
    get centerPos () {
        let cPos = new Vector2 (
            this.pos.x + this.halfWidth,
            this.pos.y + this.halfHeight
        )
        return cPos;
    }
}

class World {
    static spawnPos = new Vector2(250, 250);
}

class Player extends GameObject {
    static playerSizeX = 100;
    static playerSizeY = 100;
    static playerMoveSpeed = 15;
    destination = Vector2.zero;
    velX = 0;
    velY = 0;
    username;
    speechBubbles = [];
    color;

    constructor(id, pos, username, color) {
        super ("PLAYER-"+username, pos);
        this.username = username;
        this.color = color;
    }
    
    warpTo(pos) {
        this.pos = pos;
    }
    
    walkTo(pos) {
        this.destination = pos;
        let angle = Math.atan2(this.destination.y-this.pos.y, this.destination.x-this.pos.x);
        this.velX = Math.cos(angle)*this.constructor.playerMoveSpeed;
        this.velY = Math.sin(angle)*this.constructor.playerMoveSpeed;
        
        receiveMessage("Vel X: " + truncateNumber(this.velX,1) + "   Vel Y: " + truncateNumber(this.velY,1));
        receiveMessage("Angle: " + truncateNumber(angle,1));
        receiveMessage("Cam X: " + truncateNumber(activeCamera.x,1) + "   Cam Y: " + truncateNumber(activeCamera.y,1)+"\n");
    }
    
    update(deltaTime) {
        if (this.velX != 0 && this.velY != 0) {
            let nextX = this.x + (this.velX*deltaTime);
            let nextY = this.y + (this.velY*deltaTime);
            
            //receiveMessage("Next: " + (nextX - this.destination.x) + "    Cur: " + (this.pos.x - this.destination.x));

            // checks if current location is further than your "destination" 
            if (Math.abs(nextX-this.destination.x) > Math.abs(this.pos.x-this.destination.x)) {
                this.velX = 0;
                this.pos.x = this.destination.x;
            } else {
                this.pos.x = nextX;
            }
            
            if (Math.abs(nextY-this.destination.y) > Math.abs(this.pos.y-this.destination.y)) {
                this.velY = 0;
                this.pos.y = this.destination.y;
            } else {
                this.pos.y = nextY;
            }
        }
    }

    sayMessage(message) {
        var newBubble = new SpeechBubble(message);
        this.speechBubbles.unshift(newBubble);
    }

    drawSpeechBubbles() {
        var curBubble;
        let vertOffset = (this.constructor.playerSizeY * 0.75);
        
        for (let i = 0; i < this.speechBubbles.length; i++) {
            
            curBubble = this.speechBubbles[i];
            if (curBubble.isOld()) {
                this.speechBubbles.splice(i,i);
            } else {

                //Centering the bubble and making sure the bubbles aren't on top of eachother       
                var bubbleCenterX = this.pos.x;
                var bubbleCenterY = this.pos.y-(vertOffset);

                vertOffset += (curBubble.height);           
                
                curBubble.drawBubble(bubbleCenterX+this.pos.x, bubbleCenterY+activeCamera.pos.y);

            }
        }
    }

    drawPlayer() {
        let screenX = this.pos.screenPos.x-(this.constructor.playerSizeX/2);
        let screenY = this.pos.screenPos.y-(this.constructor.playerSizeY/2);

        let prevColor = ctx.strokeStyle;
        ctx.fillStyle = this.color;
        ctx.fillRect(screenX, screenY, this.constructor.playerSizeX, this.constructor.playerSizeY);
        ctx.fillStyle = prevColor;
        
        var prevAlign = ctx.textAlign;
        var prevFont = ctx.font;
        ctx.textAlign = 'center';
        ctx.font = this.constructor.font;
    
        ctx.fillText("<" + this.username + ">", this.pos.screenPos.x, this.pos.screenPos.y + (this.constructor.playerSizeY*.75));

        ctx.textAlign = prevAlign;
        ctx.font = prevFont;
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
    height;

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
        
        this.height = this.message.length * this.constructor.fontHeight;
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

//Called when the page is finished loading
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

function sendMessage(msg, textbox) {
    if (msg.length > 0) {
        log.textContent += userPlayer.username+" "+msg+"\n";
        textbox.clearTextbox();
        if (connected) {
            userPlayer.sayMessage(msg);
        }
    }
}

function printMessage(msg) {
    log.textContent += msg+"\n";
}

function receiveMessage(msg) {
    log.textContent += msg+"\n";
}

function updateUser(e) {
    if (e.key=="Enter") {
        setUser();
    }
}

function setUser(usr, textbox) {
    if (!connected) {
        if (usr.length > 0) {
            userPlayer = new Player(usr, World.spawnPos, usr, "#FF0000");
            receiveMessage("Username set to "+userPlayer.username);
            cameraList.push(new Camera("playerCam", Vector2.zero, 0));
            activeCamera = cameraList[cameraList.length-1];
            textbox.setDisabled(true);
            TextInput.findInputByID("chatInput").setDisabled(false);
            
            connect();
        }
    }
}

function connect() {
    startAnimating();
    otherPlayers.push(new Player("(0, 0)", new Vector2(0, 0), "(0, 0)", "#00FF00"));
    otherPlayers.push(new Player("(0, 300)", new Vector2(0, 300), "(0, 300)", "#FF0000"));
    otherPlayers.push(new Player("(0, -300)", new Vector2(0, -300), "(0, -300)", "#FFFF00"));
    otherPlayers.push(new Player("(300, 0)", new Vector2(300, 0), "(300, 0)", "#0000FF"));
    otherPlayers.push(new Player("(-300, 0)", new Vector2(-300, 0), "(-300, 0)", "#00FFFF"));
    connected = true;
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
    canvas.addEventListener("mouseup", (e) => {
        canvasClick(canvas, e)
    });
    
    cameraList.push(new Camera("default", Vector2.zero, 0.01));
    activeCamera = cameraList[0];
    
    gameCanvas = canvas;
    ctx = gameCanvas.getContext("2d");
    document.getElementById("gameSpace").appendChild(canvas);
}

function canvasClick(canvas, e) {
    
    let canvasRect = canvas.getBoundingClientRect();
    if (connected) {
        
        let worldClick = new Vector2(
            (e.clientX + activeCamera.pos.x) - (canvasRect.left + activeCamera.halfWidth), 
            (e.clientY + activeCamera.pos.y) - (canvasRect.top + activeCamera.halfHeight)
        );

        userPlayer.walkTo(worldClick);
    }
    
}

function drawText(x, y, msg) {
    ctx.font = "30px Arial";
    ctx.fillText(msg, x, y);
}

function startAnimating() {
    startTime = Date.now(); 
    drawScreen();
}

function truncateNumber(num, decimalPlaces) {
    return Math.floor(num * (decimalPlaces * 10)) / (decimalPlaces * 10);
}

function drawScreen() {
    
    //Waits fpms miliseconds before starting the next frame
    setTimeout(() => {
        beginTime = Date.now();
        requestAnimationFrame(drawScreen);
    }, fpms);
    
    activeCamera.follow(userPlayer.pos);

    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    userPlayer.drawPlayer(gameCanvas);
    userPlayer.drawSpeechBubbles(gameCanvas);
    userPlayer.update((Date.now()-startTime) / fpms);
    
    otherPlayers.forEach((element) => {
        element.drawPlayer(gameCanvas);
        element.drawSpeechBubbles(gameCanvas);
        element.update((Date.now()-startTime)/fpms);
    });
    
    startTime = Date.now();
    var fpsDecimalPlaces = 1;
    var measuredFPS = ((startTime-beginTime))*(fpsDecimalPlaces*10);
    drawText(25, 25, "FPS: " + truncateNumber(measuredFPS, fpsDecimalPlaces));
    drawText(25, 50, "Target MSPF: "+ truncateNumber(fpms, fpsDecimalPlaces)); //Target miliseconds per frame
    
    frameLength = Math.min(fpms-(Date.now()-beginTime),fpms);

    //Updates FPS graph
    DebugGraph.updateFPSGraph(frameLength);
    DebugGraph.drawFPSGraph(0, 30, 250, 100, 3); 
}

function rgb(r, g, b){
    return ["rgb(",r,",",g,",",b,")"].join("");
}
    
function ToggleDarkMode() {

    const chatBoxReference = document.getElementById("chatBox");
    if (!isDark) {
        /* enables dark mode flag */
        isDark = !isDark;

        /* changes color of webpage's background */
        document.body.style.background = rgb(54, 54, 54);

    }

    else {
        /* changes color of webpage's background */
        document.body.style.background = "white";

        /* changes color of the chatbox itself */
        chatBoxReference.style.background = "lightgrey";

        /* disables off dark mode */
        isDark = !isDark;
    }
}