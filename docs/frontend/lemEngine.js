//Canvas references
let gameCanvas;
let ctx;

//FPS tracking and measurement, debug
let startTime = 0;
let beginTime = 0;
const fps = 60;
const fpms = 1000/fps;
const scriptStart = Date.now();

//Camera properties
let activeCamera;
let cameraList = [];

document.addEventListener("resize", (event) => {
    cameraList.forEach((element) => {
        gameCanvas.width  = document.getElementById('gameSpace').clientWidth*0.8;
        gameCanvas.height = document.getElementById('gameSpace').clientHeight;
        element.resize();
    })
});

class Vector2 {
    
    x;
    y;

    static zero = new Vector2( 0, 0);
	static up   = new Vector2( 0,-1);
	static down = new Vector2( 0, 1);
	static right= new Vector2( 1, 0);
	static left = new Vector2(-1, 0);
    
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    
    screenToWorldPos() {
        let v = new Vector2(
            ((this.x + (activeCamera.pos.x * activeCamera.zoom)) - activeCamera.halfWidth)  / activeCamera.zoom,
            ((this.y + (activeCamera.pos.y * activeCamera.zoom)) - activeCamera.halfHeight) / activeCamera.zoom
        );
        return v;
    }
    
    get screenPos() {
        let v = new Vector2(
            (activeCamera.zoom * this.x + activeCamera.halfWidth)  - (activeCamera.pos.x * activeCamera.zoom),
            (activeCamera.zoom * this.y + activeCamera.halfHeight) - (activeCamera.pos.y * activeCamera.zoom),
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

}

class GameObject {
    pos;
    drawPos;

    id;
    static objs = [];

    constructor (id, pos) {
        this.id = id;
        this.pos = pos;
        this.drawOffset = new Vector2(0,0);
        GameObject.objs.push(this);
    }

    static sortVertically(a, b) {
        if (a.y + a.drawOffset.y > b.y + b.drawOffset.y ) {
            return 1; //The first game object is lower than the first
        } else if (a.y + a.drawOffset.y  < b.y + b.drawOffset.y ) {
            return -1; //The second game object is lower than the first
        }

        return 0; // The two game objects are at the same height
    }

    get x () {return this.pos.x;}
    get y () {return this.pos.y;}

    set x (v) {this.pos.x = v;}
    set y (v) {this.pos.y = v;}

    draw () {}
}

class Sprite {
    id;
    image;

    /**
     * Create a new sprite object
     * @param {String} image String file path to the image, starting in the sprites folder, including file type 
     */
    constructor (image) {
        this.id = image;
        this.image = new Image();
        this.image.src = './sprites/'+image; // Is this dangerous, given a custom input, eg "../[FILE NAME]", could a user potentially access files not intended?
    }

    /**
     * 
     * @param {Vector2} pos 
     * @param {Number} size 
     */

    draw(pos, width, height) {
        ctx.drawImage(this.image, pos.x, pos.y, width, height);
    }

    drawCentered(pos, width, height) {
        ctx.drawImage(this.image, (pos.x - width/2), (pos.y - height/2), width, height);
    }
    
}

class NineSlicedSprite extends Sprite {
    sliceCoords = [];
    segments = [];

    constructor (image) {
        super(image);

        const realWidth = this.image.width;
        const realHeight = this.image.height;

        // setting the height and witdh of each slice (each slice should be 1/9th of the image)
        this.sliceWidth = realWidth / 3;
        this.sliceHeight = realHeight / 3;
        this.segments = [
            // slice: [posX, posY, width, height]

            // [1] [2] [3]
            // [4] [5] [6]
            // [7] [8] [9]

            // Drawing the slices in the "top row" from left to right (slices 1, 2 and 3) 
            [0, 0, this.sliceWidth, this.sliceHeight],           [this.sliceWidth, 0, this.sliceWidth, this.sliceHeight],           [realWidth - this.sliceWidth, 0, this.sliceWidth, this.sliceHeight],

            // Drawing the slices in the "middle row" from left to right (slices 4, 5 and 6)
            [0, this.sliceHeight, this.sliceWidth, this.sliceHeight], [this.sliceWidth, this.sliceHeight, this.sliceWidth, this.sliceHeight], [realWidth - this.sliceWidth, this.sliceHeight, this.sliceWidth, this.sliceHeight], 

            // Drawing the slices in the "bottom row" from left to right (slices 7, 8 and 9)
            [0, realHeight - this.sliceHeight, this.sliceWidth, this.sliceHeight], [this.sliceWidth, realHeight - this.sliceHeight, this.sliceWidth, this.sliceHeight], [realWidth - this.sliceWidth, realHeight - this.sliceHeight, this.sliceWidth, this.sliceHeight]
            
        ];
    }

    // slices: [slice1, slice2, slice3, sliceN...]
    // slice: [posX, posY, width, height]
    getSlicePosX(index) {
        return this.segments[index][0];
    }

    getSlicePosY(index) {
        return this.segments[index][1];
    }

    getSliceWidth(index) {
        return this.segments[index][2];
    }

    getSliceHeight(index) {
        return this.segments[index][3];
    }
    
    draw(pos, size) {
        for (let i = 0; i < this.segments.length; i++) {
            ctx.drawImage(this.image, ...this.segments[i], pos.x, pos.y, this.getSliceWidth(i), this.getSliceHeight(i));
            console.log(pos.x);
           /* console.log(
            "index: " + i + " " +
            "Pos X: " + this.getSlicePosX(i) + " " +
            "Pos Y: " + this.getSlicePosY(i) + " " +
            "Width: " + this.getSliceWidth(i) + " " +
            "Height: " + this.getSliceHeight(i)
            ); */
        }
    
    }
}

class TileMap {
    pos;
    tiles = [];
    map = [];
    cols;
    rows;
    tileSize;

    constructor (pos, tiles, tileSize, cols, rows, map) {
        this.pos = pos;
        this.tiles = tiles;
        this.tileSize = tileSize;
        this.cols = cols;
        this.rows = rows;
        this.map = map;
    }

    draw() {
        let offsetPos = new Vector2(
            this.pos.x - this.rows * this.tileSize / 2,
            this.pos.y - this.cols * this.tileSize / 2
        )
        
        for (let i = 0; i < this.cols; i++) {
            for (let k = 0; k < this.rows; k++) {
                if (this.map[(i*this.rows) + k] != null && this.tiles[this.map[(i*this.rows) + k]] != null) { 
                    this.tiles[this.map[(i*this.rows) + k]].draw(new Vector2(
                        offsetPos.x + (i * this.tileSize),
                        offsetPos.y + (k * this.tileSize)).screenPos,
                        (this.tileSize + 1)* activeCamera.zoom, (this.tileSize + 1)* activeCamera.zoom
                    )
                }
            }
        }
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
    zoom;
    
    useLimits = false;
    limits;
    
    halfWidth;
    halfHeight;
    
    constructor(id, pos, mDist, limits) {
        super("CAMERA-"+id, pos);
    
        
        if (limits.length == 4) {
            this.useLimits = true;
            this.limits = limits;
        }

        this.resize();
        
        this.moveDist = (mDist * Math.min(this.width, this.height)) / this.zoom;
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
        let nextPosition = new Vector2(
            this.x + dif.normalized.x * Math.abs(dif.x/10),
            this.y + dif.normalized.y * Math.abs(dif.y/10)
        )
        
        if (sqrHypotenuse > this.moveDist * this.moveDist) {
            this.pos = this.moveInBounds(nextPosition);
        }
        
        
    }
    
    resize () {
        if (gameCanvas != null) {
            this.width = gameCanvas.width;
            this.height = gameCanvas.height;
            this.halfWidth = this.width / 2;
            this.halfHeight = this.height / 2;
            
            if (this.width >= this.height) {
                this.zoom = this.width  / 1000;
            } else {
                this.zoom = this.height / 1000;
            }
        }
    }
    
    moveInBounds (pos) {
        let output = pos;
        if (this.useLimits) {
            if (pos.x - this.halfWidth / this.zoom < this.limits[0]) {output.x = this.limits[0] + (this.halfWidth / this.zoom);}
            else if (pos.x + this.halfWidth / this.zoom > this.limits[2]) {output.x = this.limits[2] - (this.halfWidth / this.zoom);}
            
            if (pos.y - this.halfHeight / this.zoom < this.limits[1]) {output.y = this.limits[1] + (this.halfHeight / this.zoom);}
            else if (pos.y + this.halfHeight / this.zoom > this.limits[3]) {output.y = this.limits[3] - (this.halfHeight / this.zoom);}
        }
        return output;
    }
    
    get centerPos () {
        let cPos = new Vector2 (
            this.pos.x + this.halfWidth,
            this.pos.y + this.halfHeight
        )
        return cPos;
    }   
}

function addCanvas() {
    var canvas = document.createElement('canvas');
    canvas.id = "gameCanvas";
    canvas.width  = document.getElementById('gameSpace').clientWidth*0.8;
    canvas.height = document.getElementById('gameSpace').clientHeight;
    
    canvas.style.zIndex = 8;
    canvas.style.position = "absolute";
    canvas.style.border = "0.5rem solid rgb(105, 100, 100)";
    
    canvas.addEventListener("mouseup", (e) => {
        canvasClick(canvas, e)
    });
    
    cameraList.push(new Camera("default", Vector2.zero, 0.01, []));
    activeCamera = cameraList[0];
    
    gameCanvas = canvas;
    ctx = gameCanvas.getContext("2d");
    document.getElementById("gameSpace").appendChild(canvas);
}

function canvasClick(canvas, e) {
    let canvasRect = canvas.getBoundingClientRect();
    let worldClick = new Vector2(
            e.clientX - canvasRect.left, 
            e.clientY - canvasRect.top
        );

    onClick(e, worldClick);
}

function drawText(x, y, msg) {
    ctx.font = "30px Arial";
    ctx.fillText(msg, x, y);
}

function truncateNumber(num, decimalPlaces) {
    return Math.floor(num * (decimalPlaces * 10)) / (decimalPlaces * 10);
}

function drawScreen() {
    
    //Waits fpms miliseconds before starting the next frame
    setTimeout(() => {
        beginTime = Date.now();
        requestAnimationFrame(drawScreen);
    }, 1);
    
    update();
    
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

function update() {}

function onClick(event, canvasPos) {}