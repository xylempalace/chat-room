// Text Info
const textInputs = [];
const log = document.getElementById("values");
let isDark = false;

//Client information
let connected = false;
let loginState = "username";
let userPlayer;
let otherPlayers = [];

//Tilemap
const backgroundTiles = [
    0,
    new Sprite("tiles/floor.png"),
    new Sprite("tiles/wall.png"),
    new Sprite("tiles/grass.png"),
    new Sprite("tiles/pathCenter.png"),
    new Sprite("tiles/pathNorth.png"),
    new Sprite("tiles/pathSouth.png"),
    new Sprite("tiles/pathEast.png"),
    new Sprite("tiles/pathWest.png"),
    new Sprite("tiles/pathNone.png"),
	new Sprite("tiles/pathNorthEast.png"),
	new Sprite("tiles/pathNorthWest.png"),
    new Sprite("tiles/pathSouthEast.png"),
    new Sprite("tiles/pathSouthWest.png"),
    new Sprite("tiles/pathNorthEastInner.png"),
	new Sprite("tiles/pathNorthWestInner.png"),
    new Sprite("tiles/pathSouthEastInner.png"),
    new Sprite("tiles/pathSouthWestInner.png"),
    new Sprite("tiles/pathNorthSouth.png"),
    new Sprite("tiles/pathEastWest.png"),
];

// const board = new Board(100, 100);

const backgroundMap = new TileMap(new Vector2(0,0), backgroundTiles, 64, 32, 32, [
    11,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,13,5,16,7,7,7,7,7,7,7,7,7,7,7,14,4,4,4,4,16,7,7,7,7,7,7,7,7,7,7,7,14,6,5,6,3,3,3,3,3,3,3,3,3,3,3,10,14,4,16,7,12,3,3,3,3,3,1,3,3,3,3,3,5,6,5,6,3,3,3,3,3,3,3,3,3,9,3,3,5,16,12,3,3,3,3,3,3,3,3,3,3,1,3,3,5,6,5,6,3,3,3,3,3,3,3,3,3,3,3,11,15,6,3,3,9,3,3,3,3,3,3,1,3,3,3,3,5,6,5,6,1,3,3,3,3,3,3,3,3,3,3,5,4,6,3,3,3,3,3,3,3,3,3,1,1,1,3,3,5,6,10,12,1,1,3,3,3,3,3,3,3,3,3,5,4,6,3,3,3,3,3,3,3,3,3,1,1,1,1,3,5,6,2,2,2,1,3,3,3,3,3,3,3,3,3,10,14,6,3,3,3,3,3,3,3,3,1,1,1,1,1,3,5,6,2,2,2,1,3,3,3,3,3,3,3,3,3,3,5,17,13,3,3,3,3,3,3,3,1,1,1,3,1,3,5,6,1,1,1,1,3,3,3,3,3,3,3,3,3,3,10,14,6,3,3,3,3,3,3,3,1,1,1,1,1,3,5,6,1,1,1,1,3,3,3,3,3,3,3,3,3,3,3,5,6,3,3,3,3,3,3,3,1,3,1,1,3,3,5,6,1,1,1,3,3,3,3,3,3,3,3,11,8,8,8,15,17,8,8,8,13,3,3,3,3,3,1,3,3,3,5,6,2,2,2,3,3,3,3,3,3,3,3,5,16,7,7,14,16,7,7,14,6,3,3,3,1,3,3,3,1,3,5,6,2,2,2,1,3,3,3,3,3,3,3,5,6,3,3,5,6,3,3,5,6,3,3,3,3,3,1,3,3,3,5,6,2,2,2,1,3,3,3,3,3,3,3,5,6,3,2,1,1,2,3,5,6,3,3,3,3,3,3,3,3,3,5,6,2,2,2,3,3,3,3,3,3,3,3,5,17,8,1,1,1,1,8,15,6,3,3,3,3,3,3,3,3,3,5,6,5,6,1,3,3,3,3,3,3,3,3,5,16,7,1,1,1,1,7,14,6,2,3,2,3,2,3,2,3,2,5,6,5,6,3,3,3,3,3,3,3,3,3,5,6,3,2,1,1,2,3,5,6,3,3,3,3,3,3,3,3,3,5,6,5,6,3,3,3,3,3,3,3,3,3,5,6,3,3,5,6,3,3,5,6,3,3,3,3,3,3,3,3,3,5,6,5,6,3,3,3,3,3,3,3,3,3,5,17,8,8,15,17,8,8,15,17,13,3,3,3,3,3,3,3,3,5,6,5,6,3,3,11,19,19,19,13,3,3,10,7,7,7,7,7,7,7,14,4,6,3,3,3,3,3,3,3,3,5,6,5,6,3,11,12,1,1,1,10,13,3,3,3,3,3,3,2,3,3,10,14,17,13,3,3,3,3,3,3,3,5,6,5,6,3,18,1,11,19,13,1,18,3,3,3,3,3,3,3,3,3,3,10,14,17,8,8,13,3,3,3,3,5,6,5,6,3,18,1,18,2,18,1,18,3,3,3,3,3,3,2,3,3,3,3,10,7,14,4,17,8,13,3,3,5,6,5,6,3,18,1,10,19,12,1,18,3,3,3,3,3,3,3,3,3,3,3,3,3,5,4,4,4,6,3,3,5,6,5,6,3,10,13,1,1,1,11,12,3,3,3,3,3,3,2,3,3,3,3,3,3,10,14,4,4,6,3,3,5,6,5,6,3,3,10,19,19,19,12,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,10,14,4,17,8,8,15,6,5,6,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,3,3,3,3,3,3,3,3,10,14,4,4,4,4,6,5,6,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,5,16,7,14,4,6,5,6,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,3,3,3,3,3,3,3,11,8,15,6,3,5,4,6,5,17,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,15,4,4,17,8,15,4,6,10,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,12
]);

// WebSocket Stuff
const webSocket = new WebSocket('ws://localhost:443/');

webSocket.onmessage = (event) => {
    var obj = JSON.parse(event.data);

    if ("expired" in obj) {
        // Handles removing a disconnected player from the screen and printing a leave message
        let p = otherPlayers.findIndex((element) => {
            return element.username == obj.id;
        })
        otherPlayers[p].expired = true;
        otherPlayers.splice(p, 1);
        receiveMessage(`${obj.id} has disconnected!`);
    } else if ("msg" in obj) {
        // Handles recieving messages form other players and displaying them in the proper locations
        receiveMessage(`<${obj.id}> ${obj.msg}`);
        let p = otherPlayers.find((element) => {
            return element.username == obj.id;
        })
        if (p != null) {
            p.sayMessage(obj.msg);
        }
        if (userPlayer.username == obj.id) {
            userPlayer.sayMessage(obj.msg);
        }
    } else if ("joinMsg" in obj) {
        // Handles recieving join messages
        receiveMessage(obj.joinMsg);
    } else if ("posX" in obj && connected && userPlayer.username != obj.id) {
        // Handles displaying other players on the screen
        let p = otherPlayers.find((element) => {
            return element.username == obj.id;
        })
        if (p != null) {
            p.pos.x = obj.posX;
            p.pos.y = obj.posY; 
        } else {
            otherPlayers.push(new Player(obj.id, new Vector2(obj.posX, obj.posY), obj.id, "#FF0000"));
        }
    } else if ("invalidName" in obj) {
        // Handles recieving username selction errors and verification
        if (obj.invalidName) {
            receiveMessage(obj.usernameError);
            loginState = "username";
            const textBox = textInputs.find((element) => element.textInput.getAttribute("placeholder") == "Username");
            textBox.clearTextbox();
        } else {
            loginState = "usernameVerified";
            const textBox = textInputs.find((element) => element.textInput.getAttribute("placeholder") == "Username");
            setUser(obj.usr, textBox);
        }
    }
};

webSocket.addEventListener("open", () => {
    console.log("We are connected");
});

class TextInput {
    
    textInput;
    textButton;
    textDiv;
    sendFunction;
    static textInputs = [];

    constructor(div, placeholder, func, hasButton=true, reqConnection=true, minLength=1, maxLength=50) {
        this.sendFunction = func;
        
        this.textDiv = div;
        this.textDiv.setAttribute("class", "inputDiv");
        
        this.textInput = document.createElement("input");
        this.textInput.setAttribute("placeholder", placeholder);
        this.textInput.setAttribute("class", "inputText");
        this.textInput.setAttribute("minlength", minLength);
        this.textInput.setAttribute("maxLength", maxLength);
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

class World {
    static spawnPos = new Vector2(0, 0);
}

class PlayerCosmetic {
    color;
    sprite;
    flippedSprite;

    /**
     * 
     * @param {String} spritePath 
     * @param {String} flippedSpritePath 
     */
    constructor (spritePath, flippedSpritePath) {
        this.sprite = new Sprite(spritePath);
        this.flippedSprite = new Sprite(flippedSpritePath)
    }

    draw(pos, size, flipped = false) {
        if (!flipped) {
            this.sprite.draw(pos, size, size);
        } else {
            this.flippedSprite.draw(pos, size, size);
        }
    }

    getSpritePath() {
        let finalString = this.sprite.image.src;
        let pos = finalString.search("/player/");

        finalString = finalString.substr(pos + 1);

        return finalString;
    }
}

class Player extends GameObject {
    static playerSizeX = 75;
    static playerSizeY = 75;
    static playerMoveSpeed = 5;
    expired = false;
    destination = Vector2.zero;
    velX = 0;
    velY = 0;
    username;
    speechBubbles = [];
    color;
    cosmetics = [];
    static baseCosmetics = [new PlayerCosmetic("player/base.png", "player/base_flipped.png"), new PlayerCosmetic("player/flower.png", "player/flower_flipped.png")];
    flipped = false;

    constructor(id, pos, username, color, cosmetics = Player.baseCosmetics) {
        super ("PLAYER-"+username, pos);
        this.username = username;
        this.color = color;
        this.setCosmetics(cosmetics);
    }

//bookmark
    hasCosmeticEquipped(cosmeticName) {
        cosmeticName = "player/" + cosmeticName + ".png";
        for (let i = 0; i < this.cosmetics.length; i++) {
            if (this.cosmetics[i].getSpritePath() === cosmeticName) {
                return i;
            }
        }
        return -1;
    }

    setCosmetics(cosmeticArr) {
        cosmeticArr.forEach((i) => {
            this.cosmetics.push(i);
        })
    }

    addCosmetic(cosmeticName) {
        console.log(this.cosmetics[0].getSpritePath());
        if (this.cosmetics.includes(new PlayerCosmetic("player/" + cosmeticName + ".png", "player/" + cosmeticName + "_flipped.png"))) {
            console.log("your mom");
        
        }
        else {this.cosmetics.push(new PlayerCosmetic("player/" + cosmeticName + ".png", "player/" + cosmeticName + "_flipped.png"));
        }
    }

    removeCosmetic(cosmeticName) {
        let i = this.hasCosmeticEquipped(cosmeticName);
        if (i >= 0) {
            cosmeticName = "player/" + cosmeticName + ".png";
            this.cosmetics.splice(i, 2);
        }
    }
    
    warpTo(pos) {
        this.pos = pos;
    }
    
    walkTo(pos) {
        this.destination = pos;
        let angle = Math.atan2(this.destination.y-this.pos.y, this.destination.x-this.pos.x);
        this.velX = Math.cos(angle)*this.constructor.playerMoveSpeed;
        this.velY = Math.sin(angle)*this.constructor.playerMoveSpeed;
        
        this.flipped = this.velX < 0;
    }
    
    update(deltaTime) {
        if (this.velX != 0 && this.velY != 0) {
            let nextX = this.x + (this.velX*deltaTime);
            let nextY = this.y + (this.velY*deltaTime);
            let nextPos = new Vector2(nextX, nextY);

            StaticConvexCollider.colliders.forEach((i) => {
                if (i.isColliding(nextPos)) {
                    this.destination = this.pos;
                }
            })
            
            // Checks if current X position is further than your "destination"
            // Stops you if it is, keeps moving forward otherwise
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
        this.addCosmetic("fedora");
        var newBubble = new SpeechBubble(message);
        this.speechBubbles.unshift(newBubble);
    }

    draw() {
        this.drawPlayer();
    }

    drawSpeechBubbles() {
        if (!this.expired) {
            var curBubble;
            let vertOffset = (this.constructor.playerSizeY * 1.3 * activeCamera.zoom);
            
            for (let i = 0; i < this.speechBubbles.length; i++) {
                
                curBubble = this.speechBubbles[i];
                if (curBubble.isOld()) {
                    this.speechBubbles.splice(i,i);
                } else {

                    //Centering the bubble and making sure the bubbles aren't on top of eachother       
                    var bubbleCenterX = this.pos.screenPos.x;
                    var bubbleCenterY = this.pos.screenPos.y-(vertOffset);

                    vertOffset += (curBubble.height);           
                    
                    curBubble.drawBubble(bubbleCenterX, bubbleCenterY);
                }
            }
        }
    }

    drawPlayer() {
        if (!this.expired) {
            ctx.save();

            let playerDrawPos = new Vector2(this.left, this.top).screenPos;
            this.cosmetics.forEach((i) => {
                i.draw(playerDrawPos, Player.playerSizeX * activeCamera.zoom, this.flipped);
            })

            ctx.fillStyle = "#000000";
            ctx.textAlign = 'center';
            ctx.scale(activeCamera.zoom, activeCamera.zoom);
            ctx.font = this.constructor.font;
        
            ctx.fillText("<" + this.username + ">", this.pos.screenPos.x / activeCamera.zoom, (this.pos.screenPos.y + (this.constructor.playerSizeY * 0.8 * activeCamera.zoom)) / activeCamera.zoom);

            ctx.restore();
        }
    }

    get top () {
        return this.pos.y - (this.constructor.playerSizeY / 2);
    }

    get left () {
        return this.pos.x - (this.constructor.playerSizeX / 2);
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
        this.deathTime = this.spawnTime + this.constructor.lifeTime;

        // Checks if textbox is too long for one line, and, if so, breaks up into multiple lines
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

    //Returns true if the bubble is past its expiry time
    isOld() {
        return (Date.now() > this.deathTime);
    }

    // Draws the current bubble object at the given coordinates
    drawBubble(posX, posY) {
        

        const SpeechBubbleSprite2 = new Sprite("speechBubbleOther.png");

        var prevAlign = ctx.textAlign;
        var prevFont = ctx.font;
        ctx.textAlign = 'center';
        ctx.font = this.constructor.font;
    
        let initOffset = (this.constructor.fontHeight * (this.message.length + 1) * 0.5)
        
        for (let i = 0; i < this.message.length; i++) {
            ctx.fillText(this.message[i], posX, (posY - (this.constructor.fontHeight * (this.message.length - i))) + initOffset);
        }

        SpeechBubbleSprite2.drawCentered(new Vector2(posX, posY), this.constructor.maxWidth, (this.message.length * this.constructor.fontHeight) * 1.5 + 10);
        
        let testNineSlice = new NineSlicedSprite("SpeechBubble.png")
        testNineSlice.draw(new Vector2(posX, posY), 200);

        ctx.textAlign = prevAlign;
        ctx.font = prevFont;
    }
}

class Prop extends GameObject {
    sprite;
    size;
    center;
    centerProportion;
    ready = false;
    collider;

    /**
     * 
     * @param {Sprite} sprite Sprite object representing the image of this prop
     * @param {Vector2} pos Position in the world to draw this prop, drawing from center
     * @param {Vector2} center Center of the sprite, affecting z-sort position and where this is drawn from
     * @param {Vector2} size How large to draw this prop
     */
    constructor (sprite, pos, center, size) {
        super("PROP-"+sprite.image.src, pos);

        this.sprite = sprite;
        this.size = size;
        this.drawOffset = Vector2.zero;

        //this.center = center;
        setTimeout(() => {
            this.scaler = new Vector2(
                ((this.size.x * center.x) / this.sprite.width), 
                ((this.size.y * center.y) / this.sprite.height)
                )
            this.ready = true;
            console.log(this.scaler)
        }, 10);
    }

    draw() {
        if (this.ready) {
            this.sprite.draw(new Vector2(
                this.pos.x - (this.scaler.x), // Correct position offset from scaling
                this.pos.y - (this.scaler.y)
            ).screenPos, this.size.x * activeCamera.zoom, this.size.y * activeCamera.zoom);
        }
    }

    addCollider(relativePoints) {
        this.collider = new StaticConvexCollider(this.pos, relativePoints);
    }
}

class Abyss {
    static bgImage;
    static bgImageLoaded = false;
    static bgPattern;

    static xOffset;
    static moveScale;

    static init() {
        // Declare that the abyss isn't loaded yet
        Abyss.bgImageLoaded = false;

        // Declare its starting offset and speed
        Abyss.xOffset = 0;
        Abyss.moveScale = 0.1;

        // Prepare image and update flag once ready
        Abyss.bgImage = new Image();
        Abyss.bgImage.onload = function () {

            // Create pattern for filling rect when drawn
            Abyss.bgPattern = ctx.createPattern(Abyss.bgImage, "repeat");
            printMessage("aaaa")

            Abyss.bgImageLoaded = true;
        }
        Abyss.bgImage.src = "./sprites/bg.png";
    }

    static draw(delta) {
        if (Abyss.bgImageLoaded) {
            ctx.save();
            let offsetx = activeCamera.pos.x * -Abyss.moveScale;
            let offsety = activeCamera.pos.y * -Abyss.moveScale;
            ctx.translate(offsetx, offsety);

            ctx.fillStyle = Abyss.bgPattern;
            ctx.fillRect(-offsetx, -offsety, gameCanvas.width - offsetx, gameCanvas.height - offsety)
            ctx.restore();
        }
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
                foundInputs[i].getAttribute("reqConnection"),
                foundInputs[i].getAttribute("minLength"),
                foundInputs[i].getAttribute("maxLength")
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
        textbox.clearTextbox();
        if (connected) {
            webSocket.send(JSON.stringify({
                id: userPlayer.username,
                msg: `${msg}`
            }));
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
        if (loginState == "username") {
            if (usr.length > 0) {
                userPlayer = new Player(usr, World.spawnPos, usr, "#FF0000");
                webSocket.send(JSON.stringify({
                    id: `${userPlayer.username}`
                }));
            }
            loginState = "awaitingVerification";
        } else if (loginState == "usernameVerified") {
            loginState = "playing";
            receiveMessage("Username set to "+userPlayer.username);
            cameraList.push(new Camera("playerCam", Vector2.zero, 0.01, [-1024, -1024, 1024, 1024]));
            activeCamera = cameraList[cameraList.length-1];
            textbox.setDisabled(true);
            TextInput.findInputByID("chatInput").setDisabled(false);
            
            connect();
            startAnimating();
        }
    }
}

function connect() {
    
    //otherPlayers.push(new Player("(0, 0)", new Vector2(0, 0), "(0, 0)", "#00FF00"));

    let centerDist = 500;
    otherPlayers.push(new Player("(0, " + centerDist + ")", new Vector2(0, centerDist), "(0, " + centerDist + ")", "#FF0000"));
    otherPlayers.push(new Player("(0, -" + centerDist + ")", new Vector2(0, -centerDist), "(0, -" + centerDist + ")", "#FFFF00"));
    otherPlayers.push(new Player("(" + centerDist + ", 0)", new Vector2(centerDist, 0), "(" + centerDist + ", 0)", "#0000FF"));
    otherPlayers.push(new Player("(-" + centerDist + ", 0)", new Vector2(-centerDist, 0), "(-" + centerDist + ", 0)", "#00FFFF"));
    connected = true;
    serverUpdate();
}

function startAnimating() {
    Abyss.init();

    let smallCollider = [
        Vector2.up.mul(20), 
        Vector2.left.mul(50), 
        Vector2.down.mul(20), 
        Vector2.right.mul(50)
    ];
    let treeCollider = [
        Vector2.up.mul(20), 
        Vector2.left.mul(50), 
        Vector2.down.mul(20), 
        Vector2.right.mul(50)
    ];

    let treeA = new Sprite("tree.png");
    let treeB = new Sprite("tree2.png");
    let pillar_1 = new Sprite("pillar_1.png");
    let pillar_2 = new Sprite("pillar_2.png");
    let pillar_3 = new Sprite("pillar_3.png");
    let pillar_4 = new Sprite("pillar_4.png");
    new Prop(treeB, new Vector2(-800, -450), new Vector2(256, 420), new Vector2(300, 300)).addCollider(treeCollider);
    new Prop(treeA, new Vector2(-400, -250), new Vector2(170, 420), new Vector2(300, 300)).addCollider(treeCollider);
    new Prop(treeB, new Vector2(50, -850), new Vector2(256, 420), new Vector2(500, 500)).addCollider([Vector2.up.mul(20), Vector2.left.mul(50), Vector2.down.mul(20), Vector2.right.mul(100)]);
    new Prop(treeA, new Vector2(-650, -820), new Vector2(170, 420), new Vector2(350, 350)).addCollider(treeCollider);
    new Prop(treeA, new Vector2(100, -450), new Vector2(170, 420), new Vector2(300, 300)).addCollider(treeCollider);
    new Prop(treeA, new Vector2(775, 575), new Vector2(170, 420), new Vector2(300, 300)).addCollider(treeCollider);
    new Prop(pillar_1, new Vector2(96, 96), new Vector2(256, 500), new Vector2(128, 105)).addCollider(smallCollider);
    
    startTime = Date.now(); 
    drawScreen();
}



function update() {
    activeCamera.follow(userPlayer.pos);

    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    Abyss.draw(1);
    //ctx.save();
    //ctx.fillStyle = Abyss.bgPattern;
    //ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    //ctx.restore();

    backgroundMap.draw();

    GameObject.objs.sort(GameObject.sortVertically);
    GameObject.objs.forEach((element) => {
        element.draw();
    })
    
    userPlayer.drawSpeechBubbles(gameCanvas);
    userPlayer.update((Date.now()-startTime) / fpms);
    
    otherPlayers.forEach((element) => {
        element.drawSpeechBubbles(gameCanvas);
        element.update((Date.now()-startTime) / fpms);
    });

}

function serverUpdate() {
    setTimeout(() => {
        serverUpdate();
    }, 20);
    webSocket.send(JSON.stringify({
        id: userPlayer.username,
        posX: userPlayer.pos.x,
        posY: userPlayer.pos.y
    }));
}

function rgb(r, g, b){
    return ["rgb(",r,",",g,",",b,")"].join("");
}
    //bookmark
function ToggleCosmetics() {
    if (userPlayer.hasCosmeticEquipped("fedora") >= 0) {
        userPlayer.removeCosmetic("fedora");
    }
    else {
        userPlayer.addCosmetic("fedora");
    }
    //console.log(userPlayer.hasCosmeticEquipped("fedora"));
    //userPlayer.addCosmetic("fedora");

}

function onClick(event, canvasPos) {
    if (connected) {
        userPlayer.walkTo(canvasPos.screenToWorldPos());
    }
}