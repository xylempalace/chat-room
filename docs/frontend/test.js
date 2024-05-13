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

    // Path
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

    // Cliff
    new Sprite("tiles/cliff.png"),
    new Sprite("tiles/cliffNorth.png"),
    new Sprite("tiles/cliffSouth.png"),
    new Sprite("tiles/cliffEast.png"),
    new Sprite("tiles/cliffWest.png"),
	new Sprite("tiles/cliffNorthEast.png"),
	new Sprite("tiles/cliffNorthWest.png"),
    new Sprite("tiles/cliffSouthEast.png"),
    new Sprite("tiles/cliffSouthWest.png"),
    new Sprite("tiles/cliffNorthEastInner.png"),
	new Sprite("tiles/cliffNorthWestInner.png"),
    new Sprite("tiles/cliffSouthEastInner.png"),
    new Sprite("tiles/cliffSouthWestInner.png"),
];

let abyssCollection = [];

// const board = new Board(100, 100);

const backgroundMap = new TileMap(new Vector2(0,0), backgroundTiles, 64, 32, 32, [
    20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,31,23,23,23,29,20,20,20,20,20,20,20,20,20,20,20,31,23,29,20,20,20,20,31,23,29,20,20,31,23,23,23,27,3,3,3,25,23,29,20,20,20,20,20,20,20,20,31,27,3,25,23,29,20,20,22,3,21,31,23,27,11,19,19,19,13,3,3,3,1,25,23,23,29,20,20,20,20,31,27,11,8,13,3,25,29,20,32,24,31,27,11,8,12,3,3,3,18,3,3,3,3,3,3,1,25,29,20,20,20,22,3,10,7,12,3,3,21,20,20,31,27,11,15,6,3,3,11,8,12,3,3,3,3,1,3,3,3,21,20,20,20,22,1,3,3,3,3,3,21,20,31,27,3,5,4,6,3,3,5,6,3,3,3,3,3,1,1,1,3,21,20,20,20,22,1,1,3,3,3,26,30,20,22,3,3,5,4,6,3,3,5,12,3,3,3,3,3,1,1,1,1,25,29,20,31,27,2,1,3,3,3,21,20,20,22,3,3,10,14,6,3,11,6,3,3,3,3,3,1,1,1,1,1,3,21,20,20,2,2,1,3,3,3,21,20,31,27,3,3,3,5,17,8,16,12,3,3,3,3,3,1,1,1,3,1,3,21,20,20,2,1,1,3,3,3,21,31,27,3,3,3,3,5,4,16,12,3,3,3,3,3,3,1,1,1,1,1,3,25,29,20,2,1,1,3,3,3,25,27,3,3,3,11,8,15,4,6,3,11,13,3,3,3,3,1,3,1,1,3,3,3,21,20,2,1,3,3,3,3,3,3,3,3,11,15,4,4,4,17,8,15,17,13,3,3,3,3,3,1,3,3,3,3,21,20,2,2,3,3,3,3,3,3,3,3,5,16,7,7,14,16,7,7,14,6,3,3,3,1,3,3,3,1,3,3,21,20,2,2,1,3,3,3,3,3,3,11,15,6,3,3,10,12,3,3,5,17,13,3,3,3,3,1,3,3,3,3,21,20,2,2,1,3,3,3,3,3,3,5,4,6,3,2,1,1,2,3,5,4,6,3,3,3,3,3,3,3,3,3,21,20,2,2,3,3,3,3,3,3,11,15,4,17,13,1,1,1,1,11,15,4,6,3,3,3,3,3,3,3,3,3,21,32,28,1,3,3,3,3,3,3,10,14,4,16,12,1,1,1,1,10,14,16,12,3,3,3,3,3,3,3,3,3,21,20,22,3,3,3,3,3,3,3,3,5,4,6,3,2,1,1,2,3,5,6,3,3,3,3,3,3,3,3,3,3,21,20,22,3,3,3,3,3,3,3,3,10,14,6,3,3,11,13,3,3,5,17,13,3,3,3,3,3,3,3,3,26,30,20,22,3,3,3,3,3,3,3,3,3,5,17,8,8,15,17,8,8,15,4,17,13,3,3,3,11,13,3,3,21,20,20,22,3,3,11,19,19,19,13,3,3,10,7,7,7,7,7,7,7,14,4,4,17,8,8,8,15,17,13,3,21,20,20,22,3,11,12,1,1,1,10,13,3,3,3,3,3,3,3,3,3,10,14,4,4,4,4,4,4,4,6,3,21,20,20,22,3,18,1,11,19,13,1,18,3,3,3,3,3,3,3,3,3,3,10,14,4,4,4,4,4,4,6,3,21,20,20,32,28,18,1,18,2,18,1,18,3,3,3,3,3,3,3,3,3,3,3,10,14,4,4,4,4,4,6,3,21,20,20,20,22,18,1,10,19,12,1,18,3,3,3,3,26,24,24,28,3,3,3,3,5,4,16,7,14,4,6,3,21,20,20,20,22,10,13,1,1,1,11,12,3,3,3,3,21,20,20,22,3,3,3,3,10,14,6,3,5,4,17,13,21,20,20,20,22,3,10,19,19,19,12,3,3,3,3,26,30,20,20,32,28,3,3,3,3,5,6,3,5,4,16,12,21,20,20,20,32,28,3,3,3,3,3,3,3,3,26,30,20,20,20,20,32,28,3,3,3,5,17,8,15,4,6,26,30,20,20,20,20,22,3,3,3,3,3,3,3,3,21,20,20,20,20,20,20,32,28,3,3,10,14,4,4,16,12,21,20,20,20,20,20,32,28,3,3,3,26,24,24,24,30,20,20,20,20,20,20,20,32,24,28,3,10,7,7,12,26,30,20,20,20,20,20,20,32,24,24,24,30,20,20,20,20,20,20,20,20,20,20,20,20,20,32,24,24,24,24,24,30,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20
]);
const SpeechBubbleSprite = new NineSlicedSprite("speechBubble.png"  , [16, 16, 16, 24]);

// WebSocket Stuff
const webSocket = new WebSocket('ws://localhost:3000/');

ImageManipulator.init();

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
            p.flipped = obj.flipped;
        } else {
            var newPlayer = new Player(obj.id, new Vector2(obj.posX, obj.posY), obj.id, "#FF0000");
            newPlayer.flipped = obj.flipped;
            otherPlayers.push(newPlayer);
        }
    } else if ("invalidName" in obj || obj.invalidName) {
        // Handles recieving username selction errors and verification
        if (obj.invalidName) {
            console.log("Reason for invalid username: " + obj.usernameError); 

            console.log("Username is invalid!"); 
            if (obj.usernameError === "Username Taken"){
                document.getElementById("usernameErrorMsg").innerHTML = "Username is taken!";
                
            }
            else{
                document.getElementById("usernameErrorMsg").innerHTML = "Username is profane or invalid!";
            }
            setTimeout(() => {
                document.getElementById("usernameErrorMsg").innerHTML = ""
            }
            ,5000);

            receiveMessage(obj.usernameError);
            loginState = "username";
          //  const textBox = textInputs.find((element) => element.textInput.getAttribute("placeholder") == "Username");
          document.getElementById("usernameInput").value = "";
            document.getElementById("container");
            
        } else {
            console.log("hi");
            loginState = "usernameVerified";
            const textBox = textInputs.find((element) => element.textInput.getAttribute("placeholder") == "Username");
            console.log("set user after uV");
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
           /* this.textButton = document.createElement("button");
            this.textButton.setAttribute("class", "inputButton");
            this.textButton.addEventListener("click", () => {this.sendText()});

            this.textButton.textContent = "🠊    ";
            this.textDiv.append(this.textButton);
            */
            this.textButton = document.getElementById("loginButton"); 
            this.textButton.addEventListener("click", () => {this.sendText()});
            //this.textDiv.append(this.textButton);
            

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
    name;
    type;

    static defaultAnchor = new Vector2(0, 0);
    static headAnchor = new Vector2(0.25, -0.25);

    anchor;

    /**
     * 
     * @param {String} spritePath 
     * @param {String} name Name of cosmetic
     * @param {String} type 
     */
    constructor (spritePath, name, type = 'default') {
        this.sprite = new Sprite(spritePath);
        this.flippedSprite = this.sprite;

        switch (type) {
            case 'default':
                this.type = 'default';
                this.anchor = PlayerCosmetic.defaultAnchor;
                break;
            case 'head':
                this.type = 'head';
                this.anchor = PlayerCosmetic.headAnchor;
                break;

            case 'body':
                this.type = 'body';
                this.anchor = PlayerCosmetic.defaultAnchor;
                break;

            default:
                throw new Error(`Cosmetic type "${type}" is invalid`);
                break;
        }

        this.sprite.image.onload = (e) => {
            ImageManipulator.manip(this.sprite.image, ["flipX"]).then((out) => {
                this.flippedSprite = new Sprite(out);
            });
        };
    }

    draw(pos, size, flipped = false) {
        if (!flipped) {
            let drawPos = new Vector2(pos.x + (size * this.anchor.x), pos.y + (size * this.anchor.y));
            this.sprite.draw(drawPos, size);
        } else {
            let drawPos = new Vector2(pos.x - (size * this.anchor.x), pos.y + (size * this.anchor.y));
            this.flippedSprite.draw(drawPos, size);
        }
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
    static baseCosmetics = [new PlayerCosmetic("player/base.png", "base", 'body')];
    flipped = false;

    constructor(id, pos, username, color, cosmetics = Player.baseCosmetics) {
        super ("PLAYER-"+username, pos);
        this.username = username;
        this.color = color;
        this.cosmetics = cosmetics;
    }

    setCosmetics(cosmeticArr) {
        this.cosmetics = cosmeticArr;
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
        var newBubble = new SpeechBubble(message);
        this.speechBubbles.unshift(newBubble);
    }

    draw() {
        this.drawPlayer();
    }

    drawSpeechBubbles() {
        if (!this.expired) {
            var curBubble;
            let vertOffset = (this.constructor.playerSizeY * 1.1 * activeCamera.zoom);
            
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
        this.deathTime = this.spawnTime+this.constructor.lifeTime;

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
        var prevAlign = ctx.textAlign;
        var prevFont = ctx.font;
        ctx.textAlign = 'center';
        ctx.font = this.constructor.font;
    
        for (let i = 0; i < this.message.length; i++) {
            //SpeechBubbleSprite.draw(new Vector2(posX, posY), 50)
            ctx.fillText(this.message[i], posX, posY-(this.constructor.fontHeight*(this.message.length-(1+i))));
        }

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
    colliders = [];

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
        this.colliders.push(new StaticConvexCollider(this.pos, relativePoints));
    }
}

class Abyss {
    bgImage;
    bgImageLoaded = false;
    bgPattern;

    xOffset;
    yOffset;

    scrollSpeedX;
    scrollSpeedY;

    moveScale;

    constructor (image, moveScale, scrollSpeedX, scrollSpeedY) {

        // Declare that the abyss isn't loaded yet
        this.bgImageLoaded = false;

        // Declare its starting offset and speed
        this.xOffset = 0;
        this.yOffset = 0;
        this.scrollSpeedX = scrollSpeedX;
        this.scrollSpeedY = scrollSpeedY;
        this.moveScale = moveScale;

        // Prepare image and update flag once ready
        let self = this;
        this.bgImage = new Image();
        this.bgImage.onload = function () {

            // Create pattern for filling rect when drawn
            self.bgPattern = ctx.createPattern(self.bgImage, "repeat");
            self.bgImageLoaded = true;
        }
        this.bgImage.src = image.src;
    }

    /*draw(delta) {
        if (this.bgImageLoaded) {
            ctx.save();

            let offsetx = this.xOffset;
            offsetx += activeCamera.pos.x * -this.moveScale;
            offsetx += this.scrollSpeedX * delta;

            let offsety = this.yOffset;
            offsety += activeCamera.pos.y * -this.moveScale;
            offsety += this.scrollSpeedY * delta;

            ctx.translate(offsetx, offsety);

            this.xOffset = offsetx;
            this.yOffset = offsety;

            ctx.fillStyle = this.bgPattern;
            ctx.fillRect(offsetx, offsety, gameCanvas.width * 2 - offsetx, gameCanvas.height * 2 - offsety)
            ctx.restore();
        }
    }*/

    draw(delta) {
        if (this.bgImageLoaded) {
            ctx.save();

            let offsetx = this.xOffset;
            offsetx += activeCamera.pos.x * -this.moveScale;
            //offsetx += this.scrollSpeedX * Date.time;

            let offsety = this.yOffset;
            offsety += activeCamera.pos.y * -this.moveScale;
            //offsety += this.scrollSpeedY * Date.time;

            ctx.translate(offsetx, offsety);

            ctx.fillStyle = this.bgPattern;
            ctx.fillRect(-offsetx, -offsety, (gameCanvas.width * 2) - offsetx, (gameCanvas.height * 2) - offsety)
            ctx.restore();
        }
    }
}

/**
 * Called when the page is finished loading
 */
document.addEventListener("readystatechange", (e) => {

    
    if (e.target.readyState === "complete") {
      //  setUser(document.getElementById("usernameInput"));
      const textInput = document.getElementById('usernameInput');
      const submitButton = document.getElementById('loginButton');

        ImageManipulator.init();
    
        let sliceAtlas = function (base, tilesWide, tilesHigh) {
            let prom = new Promise(outerResolve => {
                let slice = function (x, y) {
                    let params = [
                        `canvasScale ${tileWidth} ${tileHeight}`,
                        `translate ${-tileWidth * x} ${-tileHeight * y}`
                    ]

                    // This causes problems because the for loop does not wait for promises
                    // eg, if x = 1 and y = 2 are used to set the tile, then by the time the correct index is set and references x and y again, x and y will have already changed for other loops
                    // declaring an index value seperately does not fix it
                    let index = (x * tilesWide) + y;
                    ImageManipulator.manip(base, params).then((out) => {
                        seperated[index] = out;
                        if (seperated.length === tilesWide*tilesHigh) {
                            //printMessage(index);
                            outerResolve(seperated);
                        }
                    });
                }

                let tileWidth = base.width / tilesWide; // Calculate how wide each tile is
                let tileHeight = base.height / tilesHigh; // Same, but for height

                // Create an array to store each seperated tile
                let seperated = [];
                
                for (let j = 0; j < tilesWide; j++) { // Go through each column
                    for (let k = 0; k < tilesHigh; k++) { // Then each tile in that column
                        //printMessage((j * tilesWide) + k)
                        slice(j + 0, k + 0);
                    }
                }
            })

            // Once each tile is sliced, add them to background tiles in a group
            // With multiple atlases, these groups might get swapped depending on which finishes first
            prom.then((out) => {
                out.forEach((i) => {
                    backgroundTiles.push(new Sprite(i));
                })
                backgroundMap.tiles = backgroundTiles;
            });
        }

        let path = new Image();
        path.src = '/sprites/tiles/pathAtlas.png';
        sliceAtlas(path, 4, 4);
      
        textInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                submitButton.click();
            }
        });

            const foundInputs = document.getElementById("usernameInput");
        for (let i = 0; i < foundInputs.length; i++) {
            let tI = new TextInput(
               foundInputs[i],
                foundInputs[i].getAttribute("placeholder"),
                foundInputs[i].getAttribute("func"),
                //foundInputs[i].getAttribute("hasButton"),
                //foundInputs[i].getAttribute("reqConnection"),
               foundInputs[i].getAttribute("minLength"),
               foundInputs[i].getAttribute("maxLength")
            );
            textInputs.push(tI);
        }
         document.getElementById("usernameInput").value = ""
        let chatInput = TextInput.findInputByID("chatInput");
    
      // chatInput.setDisabled(true);
        addCanvas();
        drawText(100, 100, "Connecting...");
    }

});

/**
 * Sends the string in the message box to the server
 * @param {String} msg 
 */
function sendMessage(msg) {
    if (msg.length > 0) {
        document.getElementById("chatInput").value = ""; 
        if (connected) {
            webSocket.send(JSON.stringify({
                id: userPlayer.username,
                msg: `${msg}`
            }));
        }
    }
}

/**
 * Adds the given string to the chatlog
 * @param {String} msg 
 */
function printMessage(msg) {
    log.textContent += msg+"\n";
}

/**
 * Adds the given string to the chatlog
 * @param {String} msg 
 */
function receiveMessage(msg) {
    log.textContent += msg+"\n";
}

function updateUser(e) {
    if (e.key=="Enter") {
        console.log("enter key pressed");
        setUser();
    }
}

/**
 * Attempts to create a new user in accordance with the server, and, if successful, begins the game
 * @param {String} usr 
 */
function setUser(usr) {
    
    console.log("setUser called");
    if (!connected) {
        if (loginState == "username") {
            console.log(usr);
            console.log("length:" + usr.length);
            if (usr.length > 2 && usr.length < 20){
                webSocket.send(JSON.stringify({
                    id: `${usr}`
                }));
                loginState = "awaitingVerification";
            }
        } else if (loginState == "usernameVerified") {
            userPlayer = new Player(usr, World.spawnPos, usr, "#FF0000");
            document.querySelector(".popup").style.display = "none";
            document.querySelector(".container").style.display="none";
            loginState = "playing";
            receiveMessage("Username set to "+userPlayer.username);
            cameraList.push(new Camera("playerCam", Vector2.zero, 0.01, [-1024, -1024, 1024, 1024]));
            activeCamera = cameraList[cameraList.length-1];

            document.getElementById('chatInput').addEventListener('keypress', function(e){
                console.log("TESSTTTT");    
                if(e.key==="Enter"){
                    console.log("inside ekey pressed");
                    document.getElementById('sendMessageButton').click(); 
                    }
                }
            )

            connect();
        }

        console.log("Final login state: " + loginState);
    }

}

/**
 * Starts the game
 */
function connect() {
    connected = true;
    serverUpdate();
    startAnimating();
}

function startAnimating() {

    let bg = new Image();
    bg.onload = function () {
        abyssCollection.push(new Abyss(bg, 0.1, 0, 0));
        bg = new Image();
        bg.onload = function () {
            abyssCollection.push(new Abyss(bg, 0.5, 1, 0));
        }
        bg.src = "./sprites/bg2.png";
    }
    bg.src = "./sprites/bg.png";

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
    new Prop(treeB, new Vector2(-750, -550), new Vector2(256, 420), new Vector2(300, 300)).addCollider(treeCollider);
    new Prop(treeA, new Vector2(-400, -270), new Vector2(170, 420), new Vector2(300, 300)).addCollider(treeCollider);
    new Prop(treeB, new Vector2(50, -850), new Vector2(256, 420), new Vector2(500, 500)).addCollider([Vector2.up.mul(20), Vector2.left.mul(50), Vector2.down.mul(20), Vector2.right.mul(100)]);
    new Prop(treeA, new Vector2(-650, -820), new Vector2(170, 420), new Vector2(350, 350)).addCollider(treeCollider);
    new Prop(treeA, new Vector2(100, -450), new Vector2(170, 420), new Vector2(300, 300)).addCollider(treeCollider);
    new Prop(treeB, new Vector2(-850, 570), new Vector2(256, 420), new Vector2(300, 300)).addCollider(treeCollider);
    new Prop(treeA, new Vector2(635, 575), new Vector2(170, 420), new Vector2(500, 500)).addCollider([Vector2.up.mul(20), Vector2.left.mul(50), Vector2.down.mul(20), Vector2.right.mul(100)]);
    new Prop(pillar_1, new Vector2(96, 96), new Vector2(256, 500), new Vector2(128, 105)).addCollider(smallCollider);
    new Prop(pillar_2, new Vector2(-96, -96), new Vector2(256, 500), new Vector2(128, 105)).addCollider(smallCollider);
    new Prop(pillar_3, new Vector2(96, -96), new Vector2(256, 500), new Vector2(128, 105)).addCollider(smallCollider);
    new Prop(pillar_4, new Vector2(-96, 96), new Vector2(256, 500), new Vector2(128, 105)).addCollider(smallCollider);

    let border = new Prop(pillar_1, new Vector2(0, 0), new Vector2(0, 0), new Vector2(1, 1));
    border.addCollider([
        new Vector2(-325, -588),
        new Vector2(-620, -570),
        new Vector2(-616, -344),
        new Vector2(-465, -345),
        new Vector2(-330, -495),
    ]);
    border.addCollider([
        new Vector2(-1020, -1024),
        new Vector2(-1000, -930),
        new Vector2(1000, -950),
        new Vector2(1020, -1010),
    ]);
    border.addCollider([
        new Vector2(40, -940),
        new Vector2(930, -725),
        new Vector2(870, -900),
    ]);
    border.addCollider([
        new Vector2(930, -725),
        new Vector2(835, -500),
        new Vector2(900, 235),
    ]);
    border.addCollider([
        new Vector2(860, -305),
        new Vector2(530, -135),
        new Vector2(525, 95),
        new Vector2(890, 440),
    ]);
    border.addCollider([
        new Vector2(890, 420),
        new Vector2(840, 820),
        new Vector2(930, 980),
    ]);
    border.addCollider([
        new Vector2(930, 700),
        new Vector2(400, 980),
        new Vector2(920, 920),
    ]);
    border.addCollider([
        new Vector2(720, 870),
        new Vector2(150, 880),
        new Vector2(100, 1020),
    ]);
    border.addCollider([
        new Vector2(140, 950),
        new Vector2(-390, 940),
        new Vector2(-400, 1020),
    ]);
    border.addCollider([
        new Vector2(-310, 950),
        new Vector2(-900, 700),
        new Vector2(-910, 960),
    ]);
    border.addCollider([
        new Vector2(-980, 300),
        new Vector2(-985, 900),
        new Vector2(-800, 730),
    ]);
    border.addCollider([
        new Vector2(-845, -120),
        new Vector2(-985, -900),
        new Vector2(-980, 320),
    ]);
    border.addCollider([
        new Vector2(-845, -120),
        new Vector2(-616, -344),
        new Vector2(-980, -350),
    ]);
    border.addCollider([
        new Vector2(-820, -600),
        new Vector2(-616, -344),
        new Vector2(-620, -570),
    ]);
    border.addCollider([
        new Vector2(-780, -940),
        new Vector2(-985, -900),
        new Vector2(-850, -700),
    ]);
    border.addCollider([
        new Vector2(-850, -700),
        new Vector2(-930, -615),
        new Vector2(-750, -580),
    ]);
    
    startTime = Date.now(); 
    drawScreen();
}

function update() {
    activeCamera.follow(userPlayer.pos);

    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Draw the background abyss
    abyssCollection.forEach((i) => {
        i.draw(1);
    })

    // Draw the tiles
    backgroundMap.draw();

    // Draw the game objects
    GameObject.objs.sort(GameObject.sortVertically);
    GameObject.objs.forEach((element) => {
        
        element.draw();
    })
    
    // Render the client's speech bubbles
    userPlayer.drawSpeechBubbles(gameCanvas);
    userPlayer.update((Date.now()-startTime) / fpms);
    
    // Render the other players's speech bubbles
    otherPlayers.forEach((element) => {
        element.drawSpeechBubbles(gameCanvas);
        element.update((Date.now()-startTime)/fpms);
    });

    // Collider rendering
   /* ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#FF00FF";
    let o = 400;
    StaticConvexCollider.colliders.forEach((i) => {
        ctx.beginPath();
        ctx.moveTo((i.points[0].x - activeCamera.pos.x) * activeCamera.zoom + o, (i.points[0].y - activeCamera.pos.y) * activeCamera.zoom + o);
        for (let j = 1; j < i.points.length; j++) {
            ctx.lineTo((i.points[j].x - activeCamera.pos.x) * activeCamera.zoom + o, (i.points[j].y - activeCamera.pos.y) * activeCamera.zoom + o);
        }
        ctx.closePath();
        ctx.fill();
    })
    ctx.restore();*/

}

/**
 * Sends actively updated info to the server
 */
function serverUpdate() {
    setTimeout(() => {
        serverUpdate();
    }, 10);
    webSocket.send(JSON.stringify({
        id: userPlayer.username,
        posX: userPlayer.pos.x,
        posY: userPlayer.pos.y,
        flipped: userPlayer.flipped
    }));
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

function onClick(event, canvasPos) {
    if (connected) {
        userPlayer.walkTo(canvasPos.screenToWorldPos());
    }
}