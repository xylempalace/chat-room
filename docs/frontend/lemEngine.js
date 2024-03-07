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

addEventListener("resize", (event) => {
    cameraList.forEach((element) => {
        gameCanvas.width  = document.getElementById('gameSpace').clientWidth*0.8;
        gameCanvas.height = document.getElementById('gameSpace').clientHeight;
        element.resize();
    })
});

class Vector2 {
    
    x;
    y;
    
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

class Sprite {
    id;
    image;
    centeredOffset;

    constructor (image) {
        this.id = image;
        this.image = new Image();
        this.image.src = './sprites/'+image; // Is this dangerous, given a custom input, eg "../[FILE NAME]", could a user potentially access files not intended?

        this.centeredOffset = new Vector2(
            -(this.image.width  / 2),
            -(this.image.height / 2)
        )
    }

    draw (pos, size) {
        ctx.drawImage(this.image, pos.x, pos.y, size, size);
    }
}

class NineSlicedSprite extends Sprite {
    sliceCoords = [];
    segments = [];
    
    constructor (image, sc) {
        super(image);
        this.sliceCoords = sc
        let w = this.image.width;
        let h = this.image.height;
        let r = this.image.width - sc[2];
        let b = this.image.height - sc[3];
        this.segments = [
            [0    , 0    , sc[0], sc[1]], [sc[0], 0    , r   , sc[1]], [r    , 0    , w    , sc[1]], 
            [0    , sc[1], sc[0], b    ], [sc[0], sc[1], r   , b    ], [r    , sc[1], w    , b    ],
            [0    , b    , sc[0], h    ], [sc[0], b    , r   , h    ], [r    , b    , w    , h    ],
        ];
    }
    
    draw (pos, size) {
        let s = size / 3;
        foreach ((element) => {
            ctx.drawImage(this.image, element[0], element[1], element[2], element[3], pos.x + element[0], pos.y + element[1], s * element[2], s * element[3]);
        })
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

    draw () {
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
                        (this.tileSize + 1)* activeCamera.zoom
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
    
    cameraList.push(new Camera("default", Vector2.zero, 0.01, []));
    activeCamera = cameraList[0];
    
    gameCanvas = canvas;
    ctx = gameCanvas.getContext("2d");
    document.getElementById("gameSpace").appendChild(canvas);
}

function canvasClick(canvas, e) {
    let canvasRect = canvas.getBoundingClientRect();
    if (connected) {
        let worldClick = new Vector2(
            e.clientX - canvasRect.left, 
            e.clientY - canvasRect.top
        );
        
        userPlayer.walkTo(worldClick.screenToWorldPos());
    }
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
    }, fpms);
    
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