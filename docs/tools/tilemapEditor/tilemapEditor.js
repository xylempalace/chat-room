//Text info
const textInputs = [];
const log = document.getElementById("values");
const tileSelect = document.getElementById("selectTile");
let isDark = false;

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
let selectedTileIndex = 0;
let selectedTile = tilePalette[selectedTileIndex];

let rows = 8;
let cols = 8;

let map = new TileMap(new Vector2(0,0), tilePalette, 1, rows, cols, []);
let drawnMap = {}

tileSelect.addEventListener("input", () => {
    selectedTileIndex =  tileSelect.selectedIndex;
    selectedTile = tilePalette[selectedTileIndex];
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
        
        for (let i = 1; i < tilePalette.length; i++) {
            opt = document.createElement("option");
            opt.text = tilePalette[i].toString.substr(tilePalette[i].toString.lastIndexOf("/") + 1, tilePalette[i].toString.lastIndexOf("."));
            tileSelect.add(opt);
        }

        addCanvas();
        startAnimating()
    }

});

function printMessage(msg) {
    log.textContent += msg+"\n";
}

function canvasClick(pos) {
    let x = Math.floor(pos.x / 16);
    let y = Math.floor(pos.y / 16);
    if (!(pos.x in drawnMap)) {
        /*drawnMap.push({
            key:   pos.x,
            value: {
                key:   pos.y,
                value: selectedTileIndex
            }
        });*/
        drawnMap.x.y = selectedTileIndex;
    } else if (!(pos.y in drawnMap[pos.x])) {
        drawnMap.push({
            key:   pos.y,
            value: selectedTileIndex
        });     
    } else {
        drawnMap[pos.x][pos.y] = selectedTileIndex;
    }
}

function startAnimating() {
    startTime = Date.now(); 
    drawScreen();
}

function update() {
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    let assembledMap = []
    for (let j = 0; j < rows; j++) {
        for (let k = 0; k < cols; k++) {
            if (j in drawnMap && k in drawnMap[j]) {
                assembledMap[(j * rows) + k] = drawnMap[j][k];
            } else {
                assembledMap[(j * rows) + k] = null;
            }
        }
    }
    map.map = assembledMap;
    map.draw();
}