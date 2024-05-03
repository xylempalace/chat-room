//Text info
const textInputs = [];
const log = document.getElementById("values");
const tileSelect = document.getElementById("selectTile");
const colliderSelect = document.getElementById("colliderSelect");
const collider_increase = document.getElementById("collider_increase");
const collider_decrease = document.getElementById("collider_decrease");
const rowSelect = document.getElementById("rows");
const colSelect = document.getElementById("cols");
const zoom_in = document.getElementById("zoom_in");
const zoom_out = document.getElementById("zoom_out");
let isDark = false;

let drawing = false;
let mousePos = new Vector2(0,0);

let colliderWidth = 0.5;
let colliderHeight = 0.5;

class Tile {
    tileRules = [];
    name = "newTile";

    constructor (name, rules = []) {
        this.tileRules = rules;
        this.name = name;
    }

    findBestMatch(area) {

        let best = 0;

        for (let i = this.tileRules.length - 1; i >= 0; i--) {
            if (this.tileRules[i].matches(area)) {
                best = i;
                i = -1;
            }
        }

        return this.tileRules[best].sprite;
    }
}

class TileRule {
    sprite;
    rule = [
        0, 0, 0, 
        0, 0, 0, 
        0, 0, 0,
    ];

    constructor (sprite, rule = [0, 0, 0, 0, 0, 0, 0, 0, 0]) {
        this.sprite = sprite;
        this.rule = rule;
    }

    matches (nearbyTiles = []) {
        let score = 0;
        let thisIndex = nearbyTiles[4];
        for (let i = 0; i < 9; i++) {
            if (i === 4) {i++;}

            if (this.rule[i] == 1) {
                if (nearbyTiles[i] == thisIndex) {
                    score++;
                }
            } else if (this.rule[i] == -1) {
                if (nearbyTiles[i] != thisIndex) {
                    score++;
                }
            } else {
                score++;
            }
        }

        return score == 8;
    }
}

class ColliderType {

    relativePoints;
    name;

    constructor (name, relativePoints) {
        this.relativePoints = relativePoints
        this.name = name;
    };

    /**
     * Turns this collider into a string
     * @returns A string representing the contents of a list of each point's position that makes up this collider type
     */
    format (w, h) {
        let output = "";

        let stringify = function (v) {
            `[${v.x * w}, ${v.y * h}]`
        }

        // Add all but the final point
        for (let i = 0; i < this.relativePoints - 1; i++) {
            output += stringify(this.relativePoints[i]) + `, `;
        }

        output += `${this.relativePoints[stringify(this.relativePoints.length-1)]}`;
        return output;
    }

    getPoints(w = 1, h = w) {
        let output = [];

        this.relativePoints.forEach((i) => {
            output.push(new Vector2(i.x * w, i.y * h))
        })

        return output;
    }
} // The creator of 1984, jorjor well

class LevelCollider {
    x;
    y;
    shape;
    w;
    h;
    collider;

    static allColliders = [];

    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @param {ColliderType} shape 
     * @param {Number} w 
     * @param {Number} h 
     */
    constructor (x, y, shape, w = 1, h = 1) {
        this.x = x;
        this.y = y;
        this.shape = shape;
        this.w = w;
        this.h = h;
        
        this.collider = new StaticConvexCollider(new Vector2(x, y), shape.relativePoints)

        LevelCollider.allColliders.push(this);
    }

    format () {
        return `[${this.x}, ${this.y}, [${this.shape.format(this.w, this.h)}]]`;
    }
}

//Tilemap
const tilePalette = [
    null,
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

const colliderPalette = [
    new ColliderType("Box", [new Vector2(-1, -1), new Vector2(-1, 1), new Vector2(1, 1), new Vector2(1, -1)]),
    new ColliderType("Top-Right Triangle",    [new Vector2(-1, -1), new Vector2(-1, 1), new Vector2(1, 1)]),
    new ColliderType("Top-Left Triangle",     [new Vector2(-1, 1), new Vector2(1, 1), new Vector2(1, -1)]),
    new ColliderType("Bottom-Left Triangle",  [new Vector2(-1, -1), new Vector2(1, 1), new Vector2(1, -1)]),
    new ColliderType("Bottom-Right Triangle", [new Vector2(-1, -1), new Vector2(-1, 1), new Vector2(1, -1)]),
]

const colliders = [];

const tilesForEditor = [
    null,
    new Tile("Flooring", [
        new TileRule(tilePalette[1])]),
    new Tile("Wall", [
        new TileRule(tilePalette[2])]),
    new Tile("Grass", [
        new TileRule(tilePalette[3])]),
    new Tile("Path", [
        new TileRule(tilePalette[4]), 
        new TileRule(tilePalette[9], [0, -1, 0, -1, 0, -1, 0, -1, 0]),
		
        new TileRule(tilePalette[5], [0, -1, 0, 0, 0, 0, 0, 1, 0]), 
        new TileRule(tilePalette[6], [0, 1, 0, 0, 0, 0, 0, -1, 0]), 
        new TileRule(tilePalette[7], [0, 0, 0, 1, 0, -1, 0, 0, 0]), 
        new TileRule(tilePalette[8], [0, 0, 0, -1, 0, 1, 0, 0, 0]), 
		
		new TileRule(tilePalette[10], [0, -1, 0, 1, 0, -1, 0, 1, 0]), 
        new TileRule(tilePalette[11], [0, -1, 0, -1, 0, 1, 0, 1, 0]), 
        new TileRule(tilePalette[12], [0, 1, 0, 1, 0, -1, 0, -1, 0]), 
        new TileRule(tilePalette[13], [0, 1, 0, -1, 0, 1, 0, -1, 0]), 

        new TileRule(tilePalette[18], [0, -1, 0, 1, 0, 1, 0, -1, 0]), 
        new TileRule(tilePalette[19], [0, 1, 0, -1, 0, -1, 0, 1, 0]), 
		
        new TileRule(tilePalette[4], [0, 1, 0, 1, 0, 1, 0, 1, 0]),
    
        new TileRule(tilePalette[14], [
             0, 1,-1,
             1, 0, 1,
             0, 1, 0]), 
        new TileRule(tilePalette[15], [
            -1, 1, 0, 
             1, 0, 1, 
             0, 1, 0]), 
        new TileRule(tilePalette[16], [
             0, 1, 0, 
             1, 0, 1, 
             0, 1,-1]), 
        new TileRule(tilePalette[17], [
             0, 1, 0,
             1, 0, 1, 
            -1, 1, 0]), 
    ]),
]

let selectedTileIndex = 0;
let selectedTile = tilePalette[selectedTileIndex];

let selectedColliderIndex = 0;
let selectedCollider = tilePalette[selectedColliderIndex];

let tileSize = 16;
let rows = 8;
let cols = 8;

let map = new TileMap(new Vector2(0,0), tilePalette, tileSize, rows, cols, [1]);
let drawnMap = {
    storage: {},
    get: function (a, b){
        try {
            return this.storage[a][b];
        } catch (err) {
            return null;
        }
    },
    set: function (a, b, value){
        if (typeof this.storage[a] !== "object")
            this.storage[a] = {};
        this.storage[a][b] = value;
    }
}

tileSelect.addEventListener("input", () => {
    selectedTileIndex =  tileSelect.selectedIndex;
    selectedTile = tilePalette[selectedTileIndex];
});

colliderSelect.addEventListener("input", () => {
    selectedColliderIndex =  colliderSelect.selectedIndex - 2;
    selectedCollider = tilePalette[selectedColliderIndex];
});

rowSelect.addEventListener("input", () => {
    rows = rowSelect.value;
    map.rows = rows;
});

colSelect.addEventListener("input", () => {
    cols = colSelect.value;
    map.cols = cols;
});

zoom_in.addEventListener("click", () => {
    activeCamera.zoom += 0.1;
    printMessage(activeCamera.zoom);
});

zoom_out.addEventListener("click", () => {
    activeCamera.zoom -= 0.1;
    printMessage(activeCamera.zoom);
});

collider_increase.addEventListener("click", () => {
    colliderHeight += 0.25;
    colliderWidth += 0.25;
});

collider_decrease.addEventListener("click", () => {
    colliderHeight -= 0.25;
    colliderWidth -= 0.25;
});



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
        
        let opt;

        // Tile pallete selection
        opt = document.createElement("option");
        opt.text = "None";
        tileSelect.add(opt);
        
        for (let i = 1; i < tilesForEditor.length; i++) {
            opt = document.createElement("option");
            opt.text = tilesForEditor[i].name;
            tileSelect.add(opt);
        }

        // Collider options
        opt = document.createElement("option");
        opt.text = "None";
        colliderSelect.add(opt);

        opt = document.createElement("option");
        opt.text = "Delete";
        colliderSelect.add(opt);

        for (let i = 0; i < colliderPalette.length; i++) {
            opt = document.createElement("option");
            opt.text = colliderPalette[i].name;
            colliderSelect.add(opt);
        }

        addCanvas();
        targetMSPF = 3;
        gameCanvas.addEventListener("mouseup", (e) => {
            drawing = false;
        });
        
        gameCanvas.addEventListener("mousedown", (e) => {
            drawing = true;
            addCollider(getMousePos());
        });
        startAnimating()
    }

});

document.addEventListener("mousemove", (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
});

function sendMessage(msg) {
    drawnMap = {
        storage: {},
        get: function (a, b){
            try {
                return this.storage[a][b];
            } catch (err) {
                return null;
            }
        },
        set: function (a, b, value){
            if (typeof this.storage[a] !== "object")
                this.storage[a] = {};
            this.storage[a][b] = value;
        }
    }

    let strMap = JSON.parse("["+msg+"]"); 
    console.log(strMap);
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) { 
            let cTile = strMap[(y*rows)+x];
            console.log(cTile);
            if (cTile <= 3) {
                drawnMap.set(y, x, cTile);
            } else {
                drawnMap.set(y, x, 4);
            }
        }
    }
}

function printMessage(msg) {
    log.textContent += msg+"\n";
}

function addTile(pos) {
     {
        let x = Math.floor((pos.x / activeCamera.zoom) / tileSize);
        let y = Math.floor((pos.y / activeCamera.zoom) / tileSize);

        drawnMap.set(x, y, selectedTileIndex);
        
        log.textContent = "";
        for (let j = 0; j < rows; j++) {
            let out = "";
            for (let k = 0; k < cols; k++) {
                if (drawnMap.get(j, k) == null) {
                    out += 0 + ", ";    
                } else {
                    out += (drawnMap.get(j, k)) + ", "; 
                }
            }
            printMessage(out);
        }
    }
}

function addCollider(pos) {
    let x = Math.floor((pos.x / activeCamera.zoom) / tileSize);
    let y = Math.floor((pos.y / activeCamera.zoom) / tileSize);
    let p = new Vector2(x, y);

    // Check if the user has a tile selected
    if (selectedColliderIndex > 0) {
        // Delete tile if in delete mode
        if (selectedColliderIndex == 1) {
            let chosenCollider;
            for (let i = LevelCollider.allColliders.length-1; i >= 0; i--) {
                if (LevelCollider.allColliders[i].collider.isColliding(mousePos)) {
                    chosenCollider = i;
                    i = -1;
                }
            }

            if (chosenCollider >= 0) {
                LevelCollider.allColliders.splice(i, 1);
            }
        } else {
            printMessage("a")
            new LevelCollider(x, y, colliderPalette[selectedColliderIndex], colliderWidth, colliderHeight);
        }
    }
}

function updateMap () {
    m = []
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            if (drawnMap.get(x, y) == null || drawnMap.get(x, y) == 0) {
                m[(x * cols) + y] = null;
            } else {
                m[(x * cols) + y] = tilePalette.indexOf(tilesForEditor[drawnMap.get(x, y)].findBestMatch([
                    drawnMap.get(x-1, y-1), drawnMap.get(x  , y-1), drawnMap.get(x+1, y-1),
                    drawnMap.get(x-1, y  ), drawnMap.get(x  , y  ), drawnMap.get(x+1, y  ),
                    drawnMap.get(x-1, y+1), drawnMap.get(x  , y+1), drawnMap.get(x+1, y+1),
                ]));
            }
        }
    }
    map.map = m;
}

function startAnimating() {
    startTime = Date.now(); 
    let lastPrintTime = Date.now();
    targetMSPF = 1000;
    activeCamera = new Camera("VIEWPORT", new Vector2(0, 0), 0, []);
    drawScreen();
}

function getMousePos() {
    let canvasRect = gameCanvas.getBoundingClientRect();
    let c = new Vector2(
        mousePos.x - canvasRect.left, 
        mousePos.y - canvasRect.top
    );

    return c;
}

function update() {
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Add tiles at the current mouse pos if we are currently drawing new tiles
    if (drawing) {
        let c = getMousePos();
        addTile(c);
    }

    updateMap();
    log.textContent = map.map;
    map.draw();


    if (selectedColliderIndex !== 0) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        LevelCollider.allColliders.forEach((i) => {
            ctx.beginPath();
            ctx.moveTo(
                i.collider.points[i.collider.points.length - 1].x * activeCamera.zoom * tileSize, 
                i.collider.points[i.collider.points.length - 1].y * activeCamera.zoom * tileSize
            );

            i.collider.points.forEach((k) => {
                ctx.lineTo(k.x * activeCamera.zoom * tileSize, k.y * activeCamera.zoom * tileSize);
            })

            ctx.fill();
        })
        ctx.restore();
    }
}