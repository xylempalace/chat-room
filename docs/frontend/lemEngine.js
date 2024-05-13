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

window.addEventListener("resize", (event) => {
    gameCanvas.width  = document.getElementById('gameSpace').clientWidth;
    gameCanvas.height = document.getElementById('gameSpace').clientHeight;
    cameraList.forEach((element) => {
        element.resize();
    })
});

class LMath {
    static mod(n, d) {
        return ((n % d) + d) % d;
    }

    static clamp(val, min, max) {
        if (val > max) {
            return max;
        }
        return Math.max(min, val);
    }
}

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
 
    /**
     * Adds this vector to vector v, does not effect the original vector
     * @param {Vector2} v component
     * @returns {Vector2} The sum x and y values between the two vectors
     */
    add (v) {
        let o = new Vector2(this.x + v.x, this.y + v.y);
        return o;
    }
 
    /**
     * Subtracts this vector by vector v, does not effect the original vector
     * @param {Vector2} v Subtrahend
     * @returns {Vector2} The difference of x and y values between the two vectors
     */
    sub (v) {
        let o = new Vector2(this.x - v.x, this.y - v.y);
        return o;
    }
    
    /**
     * Scales the vector by number n, does not effect original vector
     * @param {Number} n 
     * @returns {Vector2} The scaled vector
     */
    mul (n) {
        let o = new Vector2(this.x * n, this.y * n);
        return o;
    }

    /**
     * Divides the vector by number n, does not effect original vector
     * o = (x/n, y/n)
     * @param {Number} n 
     * @returns {Vector2} The divided vector
     */
    div (n) {
        let o = new Vector2(this.x / n, this.y / n);
        return o;
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
 
    get magnitude() {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }
 
    get toString() {
        return "X: " + truncateNumber(this.x, 1) + "   Y: " + truncateNumber(this.y, 1);
    }
}

class GameObject {
    pos;
    drawPos;
    id;
    collider;
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
    centeredOffset;

    /**
     * Create a new sprite object
     * @param {String} image String file path to the image, starting in the sprites folder, including file type 
     */
    constructor (image) {
        if (typeof image === 'string' || image instanceof String) {
            this.id = image;
            this.image = new Image();
            this.image.src = './sprites/'+image; // Is this dangerous, given a custom input, eg "../[FILE NAME]", could a user potentially access files not intended?
        } else {
            this.image = image;
            this.id = image.src;
            
            document.body.appendChild(this.image);
        }

        this.centeredOffset = new Vector2(
            -(this.image.width  / 2),
            -(this.image.height / 2)
        )
    }

    /**
     * 
     * @param {Vector2} pos 
     * @param {Number} width 
     * @param {Number} height 
     */
    draw (pos, width, height) {
        if (this.image.width !== 0) {
            ctx.drawImage(this.image, pos.x, pos.y, width, height);
        }
    }

    /**
     * 
     * @param {Vector2} pos 
     * @param {Number} size 
     */
    draw (pos, size) {
        if (this.image.width !== 0) {
            ctx.drawImage(this.image, pos.x, pos.y, size, size);
        }
    }

    get width () {
        return this.image.width;
    }

    get height () {
        return this.image.height;
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
                if (this.map[(i*this.rows) + k] != null && this.map[(i*this.rows) + k] != 0 && this.tiles[this.map[(i*this.rows) + k]] != null) { 
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

class ColliderEdge {

    start;
    end;
 
    angle;

    normalQuad;
    normalAngle;
   
    static renderNormals = true;
    static renderPlane = true;
 
    debugFlag = false;
   
    /**
     * Creates a new edge between two points, with the inside edge being determined as the clockwise perpendicular angle to this angle
     * @param {Vector2} start Sets the start of the edge
     * @param {Vector2} end End of the edge
     */
    constructor (start, end) {
        
        this.start = start;
        this.end = end;

        this.pos = start;

        let d = this.start.sub(this.end); // Find the difference between our start and end
        this.angle = Math.atan2(d.y, d.x); // Use that difference to calculate the angle of this line

        this.normalAngle = this.angle - (Math.PI / 2);
        this.normalQuad = LMath.mod(Math.floor(this.normalAngle * 0.6366197724), 4) + 1; // Calculate the quadrant the plane's normal will be facing towards

    }
   
    /**
     * Calculates Y position of this slope based on X
     * @param {Number} x
     * @returns The Y position on the slope of this plane at position X
     */
    calc(x) {
        let val = x - this.pos.x;
        val *= Math.tan(this.angle);
        val += this.pos.y;
        return val;
    }
   
    /**
     * Calculates X position of this slope based on Y
     * @param {Number} y
     * @returns The X position on the slope of this plane at position Y
     */
    invCalc(y) {
        let val = y - this.pos.y;
        val /= Math.tan(this.angle);
        val += this.pos.x;
        return val;
    }
   
    /**
     *
     * @param {Vector2} point Point to evaluate based on its position
     * @returns {boolean} Returns true if the point is colliding with the plane
     */
    isColliding(point) {
 
        //Assume that the point will not be within the plane
        let x_collide = false;
        let y_collide = false;
 
        // If plane faces up,
        if (this.normalQuad == 3 || this.normalQuad == 4) {
            // Check if point is beneath plane
            y_collide = this.calc(point.x) < point.y;
 
        // Otherwise the plane faces down
        } else {
            // Check if point is above plave
            y_collide = this.calc(point.x) > point.y;
        }
 
        // If plane is in 1 or 4
        if(this.normalQuad == 1 || this.normalQuad == 4) {
            // Check if point is to the left of the plane
            x_collide = this.invCalc(point.y) > point.x;
 
        // Otherwise plane is in quadrant 2 or 3
        } else {
            // Check if point is to the right of the plane
            x_collide = this.invCalc(point.y) < point.x;
        }
 
        // If the point is colliding on both the x and y planes, return true
        return (x_collide && y_collide);
    }
   
    draw() {
        if(this.renderPlane) {
            if (this.debugFlag) {
                ctx.fillStyle = "red";
            }
 
            ctx.beginPath(); // Start a new line
 
            // Calculate where to start the line
                // These two calculations could better account for slopes that have very small y components
            if (Math.abs(Math.sin(this.angle)) > 0.00005) {
                ctx.moveTo(
                    this.invCalc(0),
                    0 // 0 because we are drawing from the top side of the screen
                    )
 
                // Calculate where to end the line
                ctx.lineTo(
                    this.invCalc(1080),
                    1080 // 1080 because we are assuming that the viewport ends after 1080 pixels
                    );
            } else {
                ctx.moveTo(
                    0,
                    this.calc(0) // 0 because we are drawing from the top side of the screen
                    )
 
                // Calculate where to end the line
                ctx.lineTo(
                    1920,
                    this.calc(1920) // 1920 because we are assuming that the viewport ends after 1080 pixels
                    );
            }
 
            ctx.stroke(); // Render the line
 
            if (PlaneComponent.renderNormals) {
                ctx.beginPath();
                ctx.arc(this.pos.x, this.pos.y, 20, 0, 2 * Math.PI);
                ctx.stroke();
               
                ctx.beginPath();
                ctx.moveTo(this.pos.x, this.pos.y);
                ctx.lineTo(this.pos.x + (Math.cos(this.normalAngle) * 50), this.pos.y + (Math.sin(this.normalAngle) * 50));
                ctx.stroke();
            }
 
            if (this.debugFlag) {
                ctx.fillStyle = "black";
                this.debugFlag = false;
            }
        }
    }
}

class StaticConvexCollider  {

    static colliders = []

    points = []
    edges = []

    // Rough bounds for cheap collision detection
    rt //rough top
    rb //rough bottom
    rl //rough left
    rr //rough right

    pos;

    /**
     * A static convex collider
     * @param {Vector2} position Center position of this collider
     * @param {Array<Vector2>} relativePoints Array of vectors representing the postions of the points that make up this collider, ordered in counter clockwise order
     */
    constructor (position, relativePoints) {

        // Check if collider has enough points to be a shape
        if (relativePoints.length < 3) {
            throw (`Static convex collider attempted to be created with less than 3 points, please add more points to this collider`);
        }

        this.pos = position;

        let start = relativePoints[0].add(this.pos);
        let end;

        this.points = [start];

        let len = relativePoints.length;

        // Create variables to store the rough bounds
        this.rt = start.y; //rough top
        this.rb = start.y; //rough bottom
        this.rl = start.x; //rough left
        this.rr = start.x; //rough right

        for (let i = 1; i < len; i++) {
            end = relativePoints[i].add(this.pos); // Convert relative point position to world position

            this.points.push(end); // Add this point to our list of points
            this.edges.push(new ColliderEdge(start, end)); // Connect an edge from start to end

            start = end; // Start from the previous point

            // Check if new point is the farthest of each side to set rough edges
            if (end.x < this.rl) {
                this.rl = end.x;
            }
            if (end.x > this.rr) {
                this.rr = end.x;
            }
            if (end.y < this.rt) {
                this.rt = end.y;
            }
            if (end.y > this.rb) {
                this.rb = end.y;
            }
        }
        this.edges.push(new ColliderEdge(start, this.points[0]));

        StaticConvexCollider.colliders.push(this);
    }

    /**
     * 
     * @param {Vector2} point 
     * @returns {Boolean} Returns true if the point is colliding with
     */
    isColliding(point) {

        // Check if point is within the rough bounds
        if (point.x < this.rr && point.x > this.rl && point.y < this.rb && point.y > this.rt) {

            // Remember how many of the edges we are colliding with
            let score = 0;

            // Count how many edges we are colliding with
            this.edges.forEach((i) => {
                if (i.isColliding(point)) {
                    score++;
                }
            })

            // If we are colliding with all edges, and the shape is convex, then the point is inside the collider
            return score == this.edges.length;
        }

        return false;
    }

    set pos (v) {
        throw("Static collider cannot be moved");
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
    canvas.className = "gameCanvas shadow";
    canvas.width  = document.getElementById('gameSpace').clientWidth*0.8;
    canvas.height = document.getElementById('gameSpace').clientHeight;
    
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
    
    frameLength = Math.min(fpms-(Date.now()-beginTime),fpms);

}

function update() {}

function onClick(event, canvasPos) {}