//Text info
const textInputs = [];
const log = document.getElementById("values");
const tileSelect = document.getElementById("selectTile");
const rowSelect = document.getElementById("rows");
const colSelect = document.getElementById("cols");
const zoom_in = document.getElementById("zoom_in");
const zoom_out = document.getElementById("zoom_out");
let isDark = false;

let drawing = false;
let mousePos = new Vector2(0,0);

class Tile {
    tileRules = [];
    name = "newTile";

    constructor (name, rules = []) {
        this.tileRules = rules;
        this.name = name;
    }

    findBestMatch(area) {

        let best = 0;

        if (this.tileRules.length - 1 >= 3) {console.log("hello")}
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
        if (score == 8) {
            console.log(this.rule);
        }
        return score == 8;
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
];

const tilesForEditor = [
    null,
    new Tile("Grass", [
        new TileRule(tilePalette[3])]),
    new Tile("Wall", [
        new TileRule(tilePalette[2])]),
    new Tile("Flooring", [
        new TileRule(tilePalette[1])]),
    new Tile("Path", [
        new TileRule(tilePalette[4]), 
        new TileRule(tilePalette[5], [0, -1, 0, 0, 0, 0, 0, 1, 0]), 
        new TileRule(tilePalette[6], [0, 1, 0, 0, 0, 0, 0, -1, 0]), 
        new TileRule(tilePalette[4], [0, 1, 0, 1, 0, 1, 0, 1, 0]),]),
]

let selectedTileIndex = 0;
let selectedTile = tilePalette[selectedTileIndex];

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
        
        printMessage("a");
        let opt = document.createElement("option");
        opt.text = "None";
        tileSelect.add(opt);
        
        for (let i = 1; i < tilesForEditor.length; i++) {
            opt = document.createElement("option");
            //opt.text = tilePalette[i].toString.substr(tilePalette[i].toString.lastIndexOf("/") + 1, tilePalette[i].toString.lastIndexOf("."));
            opt.text = tilesForEditor[i].name;
            tileSelect.add(opt);
        }

        addCanvas();
        gameCanvas.addEventListener("mouseup", (e) => {
            drawing = false;
        });
        
        gameCanvas.addEventListener("mousedown", (e) => {
            drawing = true;
        });
        startAnimating()
    }

});

document.addEventListener("mousemove", (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
});

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

function updateMap () {
    m = []
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            if (drawnMap.get(x, y) == null) {
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

function update() {
    {
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

        if (drawing) {
            let canvasRect = gameCanvas.getBoundingClientRect();
            let c = new Vector2(
                mousePos.x - canvasRect.left, 
                mousePos.y - canvasRect.top
            );

            addTile(c);
        }

        updateMap();
        
        map.draw();
        
    }
}