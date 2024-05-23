class Resources {
    static ws;
    static player;
    static currentRoomID;
    static owner = false;
    static playerNum;
    static order;
    static rematch = [];
    static createGame = {};
}

class Board {
    board = [];
    rows;
    columns;

    /**
     * Grid of objects for minigames
     * @param {number} r rows of board
     * @param {number} c columns of board
     */
    constructor(r, c) {
        this.rows = r;
        this.columns = c;

        for (var i = 0; i < r; i++) {
            var emptyRow = [];
            for (var j = 0; j < c; j++) {
                emptyRow.push(null);
            }
            this.board.push(emptyRow);
        }
    }

    /**
     * Gets the object at the specified position
     * @param {Vector2} pos position of wanted object
     * @returns returns wanted object
     */
    get(pos) {
        return this.board[pos.y][pos.x];
    }

    /**
     * Gets all the objects in a row from one point to the end in a specified direction
     * @param {Vector2} pos the starting point for the returned row
     * @param {boolean} right if the the following objects in the row should be from the right of the starting point or not
     * @returns returns an array with all the objects found in the row in the specified direction
     */
    getRow(pos, right) {
        if (right) {
            return this.board[pos.y].slice(pos.x, this.board[pos.y].length);
        } else {
            return this.board[pos.y].slice(0, pos.x + 1).reverse();
        }
    }

    /**
     * Gets all the objects in a column from one point to the end in a specified direction
     * @param {Vector2} pos the starting point for the returned column
     * @param {boolean} down if the the following objects in the column should be below the starting point or not
     * @returns returns an array with all the objects found in the column in the specified direction
     */
    getColumn(pos, down) {
        var result = [];
        for (var i = 0; i < this.rows; i++) {
            result.push(this.board[i][pos.x]);
        }
        if (down) {
            return result.slice(pos.y, result.length);
        } else {
            return result.slice(0, pos.y + 1).reverse();
        }
    }

    /**
     * Gets the objects in a diagonal on the board
     * @param {Vector2} pos starting position of the diagonal scan
     * @param {number} x either a 1 or a -1 which determines the direction which the diagonal moves along the x-axis
     * @param {number} y either a 1 or a -1 which determines the direction which the diagonal moves along the y-axis
     * @returns returns an array with all the objects found in the diagonal
     */
    getDiagonal(pos, x, y) {
        var result = [];
        var j = pos.x;
        for (var i = pos.y; i < this.rows && i >= 0; i += y) {
            if (j < this.columns && j >= 0) {
                result.push(this.get(new Vector2(j, i)));
            }
            j += x;
        }
        return result;
    }

    /**
     * Sets a specified position in the board to another object
     * @param {Vector2} pos the place to be changed
     * @param obj the new object to replace the old 
     */
    set(pos, obj) {
        this.board[pos.y][pos.x] = obj;
    }

    /**
     * Sets a specified position in the board to another object
     * @param {Vector2} pos the place to be changed
     * @param obj the new object to replace the old
     * @param condition the function that determines whether or not to run set the position to the new object 
     */
    setPos(pos, obj, condition, turn) {
        if (condition(this.get(pos), turn)) {
            this.set(pos, obj);
        }
    }

    /**
     * Moves an object from one spot to another
     * @param {Vector2} fromPos the position of the object to be moved
     * @param {Vector2} toPos the destination of the moving object
     * @param condition the function that determines whether or not to move the object
     */
    move(fromPos, toPos, condition, turn) {
        if (condition(this.get(fromPos), this.get(toPos), turn)) {
            this.set(toPos, this.get(fromPos));
            this.set(fromPos, null);
        }
    }

    /**
     * Swaps two objects in the board
     * @param {Vector2} fromPos the position of the first object to be swapped
     * @param {Vector2} toPos the position of the second object to be swapped
     * @param condition the function that determines whether or not to swap the objects
     */
    swap(fromPos, toPos, condition, turn) {
        if (condition(this.get(fromPos), this.get(toPos), turn)) {
            var temp = this.get(toPos);
            this.set(toPos, this.get(fromPos));
            this.set(fromPos, temp);
        }
    }

    setRow(row, objs, condition, turn) {
        for (var i = 0; i < this.columns; i++) {
            if (condition(this.get(new Vector2(i, row)), turn)) {
                this.set(new Vector2(i, row), objs[i % objs.length]);
            }
        }
    }

    setColumn(column, objs, condition, turn) {
        for (var i = 0; i < this.rows; i++) {
            if (condition(this.get(new Vector2(column, i)), turn)) {
                this.set(new Vector2(column, i), objs[i % objs.length]);
            }
        }
    }
}

class Piece {
    value;

    /**
     * Pieces for boards
     * @param value the piece
     */
    constructor(value) {
        this.value = value;
    }
}

class Deck {
    cards = [];
    cardTypes = [];

    /**
     * Holds cards
     * @param {Array} cards the cards that will be in the deck
     * @param {*} hand whether or not the deck is a hand
     */
    constructor(cards, hand = false) {
        if (hand) {
            this.cards = cards;
        } else {
            this.cardTypes = cards;
            for (var i = 0; i < this.cardTypes.length; i++) {
                for (var j = 0; j < this.cardTypes[i].amountInDeck; i++) {
                    this.cards.push(this.cardTypes[i]);
                }
            }
            this.shuffle();
        }
    }

    /**
     * Shuffles the deck
     */
    shuffle() {
        newDeck = [];
        while (this.cards.length > 0) {
            var i = Math.floor(Math.random()) * this.cards.length;
            newDeck.push(this.cards[i]);
            delete this.cards[i];
        }
        this.cards = newDeck;
    }

    /**
     * Draws a the top card from the deck
     * @returns returns the drawn card
     */
    draw() {
        returnCard = this.cards[0];
        delete this.cards[0];
        return returnCard;
    }
}

class Card {
    value;
    amountInDeck;

    /**
     * Card object for card games
     * @param value info of the card
     * @param {number} amountInDeck amount of times the card appears in a deck
     */
    constructor(value, amountInDeck) {
        this.value = value;
        this.amountInDeck = amountInDeck;
    }
}

class Game {
    title;
    maxPlayers;
    minPlayers;
    gameBoard;
    deck;
    turn = 0;
    dimensions;
    buttons;
    processMove;
    display;
    winDisplay;

    /**
     * Game object that handles playing a game
     * @param {string} title title of the game
     * @param {number} maxPlayers max players allowed
     * @param {number} minPlayers min players allowed
     * @param {Board} board board of the game
     * @param {Vector2} dimensions the size of the window popup
     * @param rules an array of all the rules used to run the game win condition should be first one
     * @param buttons an array of all the buttons used for the player to play
     * @param processMove the code that processes the info sent from the server about the opponent's move
     * @param display the code on how to display the ui the player interacts with
     * @param winDisplay the display that shows who won
     */
    constructor(title, maxPlayers, minPlayers, board, dimensions, rules, buttons, processMove, display, winDisplay) {
        this.title = title;
        this.maxPlayers = maxPlayers;
        this.minPlayers = minPlayers;
        this.gameBoard = board;
        this.dimensions = dimensions;
        this.rules = rules;
        this.buttons = buttons;
        this.processMove = processMove;
        this.display = display;
        this.winDisplay = winDisplay;
    }

    /**
     * starting game
     * @param {number} players amount of players playing
     */
    startGame(players) {
        this.players = players;
    }

    /**
     * Switches turn
     */
    switchTurn(players) {
        this.turn++;
        this.turn %= players;
    }

    /**
     * tests if a player has won
     * @param rules win condition
     * @returns whether or not a player has one
     */
    testWin() {
        return this.rules[0](this.gameBoard, this.turn);
    }

    processIncoming(move) {
        this.processMove(move, this);
    }
}

class GameProp extends Prop {
    interactionRange;
    game;
    window;
    drawMenu = false;
    button;

    /**
     * The interactable sprite that appears in game to play a game
     * @param {sprite} sprite image of the prop
     * @param {Vector2} pos position of the prop
     * @param {Vector2} offset defines the center of the prop
     * @param {number} size size of the prop
     * @param {number} interactionRange how close the player needs to be to the prop to interact with it
     * @param {Game} game the game that this prop deals with
     */
    constructor(sprite, pos, offset, size, interactionRange, game) {
        super(sprite, pos, offset, size);

        this.interactionRange = interactionRange;
        this.game = game;
        this.window = new UiGameMenu(this.game);

        const canvas = document.getElementById("gameCanvas");
        this.button = new Button(new Vector2(canvas.width / 2, canvas.height - 45 * activeCamera.zoom), 350, 40, "#ffffff", "CLICK HERE TO PLAY", 30, null, 0, null);
    }

    /**
     * Displays the prompt to play when the player is close
     * @param {Vector2} pos position of the player  
     * @returns returns whether or not to display the prompt
     */
    interactPrompt(pos) {
        var display = distance(pos.x, this.pos.x + this.drawOffset.x, pos.y, this.pos.y + this.drawOffset.y) <= this.interactionRange;
        if (!this.drawMenu && display) {
            ctx.save();
            this.button.draw(0);
            ctx.restore();
        }
        return display;
    }
}

class UiGameMenu {
    source;
    title;
    maxPlayers;
    minPlayers;
    buttons = [];
    width;
    height;
    origin;
    windowState = 0;

    /**
     * The menu that manages joining and creating rooms for playing a specified game
     * @param {Game} source the game that this UI Menu handles
     */
    constructor(source) {
        this.source = source;
        this.title = source.title;
        this.maxPlayers = source.maxPlayers;
        this.minPlayers = source.minPlayers;
        this.width = source.dimensions.x * activeCamera.zoom;
        this.height = source.dimensions.y * activeCamera.zoom;
        const canvas = document.getElementById("gameCanvas");
        this.origin = new Vector2(canvas.width / 2 - this.width / 2, canvas.height / 2 - this.height / 2);
        this.center = new Vector2(canvas.width / 2, canvas.height / 2);
        this.buttons.push(new Button(this.center, source.dimensions.x, source.dimensions.y, "#cacaca", "", 30, null, 0, null));

        // Room Joining UI
        this.buttons.push(new Button(new Vector2(this.center.x - 130 * activeCamera.zoom, this.center.y), 220, 40, "#20ff00", "JOIN ROOM", 30, 0, 10, null));

        // Button for joining any public room
        this.buttons.push(new Button(new Vector2(this.center.x - 130 * activeCamera.zoom, this.center.y), 220, 40, "#20ff00", "JOIN ANY", 30, 10, 2, null, () => {
            Resources.ws.send(JSON.stringify({
                joinRoom: null
            }));
        }));
        // Button for joining a room by its id
        this.buttons.push(new Button(new Vector2(this.center.x + 130 * activeCamera.zoom, this.center.y), 240, 40, "#20ff00", "JOIN CODE", 30, 10, 11, null, () => {
            var gameDiv = document.createElement("div");
            gameDiv.setAttribute("id", "gameDiv");
            var input = document.createElement("input");
            input.style.left = `${this.center.x - 100}px`;
            input.style.top = `${this.center.y - 25}px`;
            input.minLength = 5;
            input.maxLength = 5;
            input.id = "joinCode";
            input.classList.add("joinCode");
            gameDiv.appendChild(input);
            var textButton = document.createElement("button");
            textButton.style.left = `${this.center.x - 100}px`;
            textButton.style.top = `${this.center.y - 36.7}px`;
            textButton.setAttribute("class", "joinButton");
            textButton.addEventListener("click", () => {
                var input = document.getElementById("joinCode");
                if (input.value.length === 5) {
                    Resources.ws.send(JSON.stringify({
                        joinRoom: input.value
                    }));
                }
            });
            textButton.textContent = "🠊";
            gameDiv.append(textButton);
            document.getElementById("gameSpace").appendChild(gameDiv);
        }));
        
        // Room Creation UI
        this.buttons.push(new Button(new Vector2(this.center.x + 130 * activeCamera.zoom, this.center.y), 240, 40, "#20ff00", "CREATE ROOM", 30, 0, 20, null));
        
        // Toggle for switching to private room
        this.buttons.push(new Button(new Vector2(this.center.x, this.center.y - 50 * activeCamera.zoom), 180, 40, "#ffb300", "PUBLIC", 30, 20, 21, null));
        // Room creation button
        this.buttons.push(new Button(new Vector2(this.center.x, this.center.y + 50 * activeCamera.zoom), 180, 40, "#20ff00", "CREATE", 30, 20, 2, null, (playersMin, playersMax) => {
            Resources.ws.send(JSON.stringify({
                newRoom: "public",
                playersMin: playersMin,
                playersMax: playersMax
            }));
        }));
        
        // Toggle for switching to public room
        this.buttons.push(new Button(new Vector2(this.center.x, this.center.y - 50 * activeCamera.zoom), 180, 40, "#00a2ff", "PRIVATE", 30, 21, 20, null));
        // Room creation button
        this.buttons.push(new Button(new Vector2(this.center.x, this.center.y + 50 * activeCamera.zoom), 180, 40, "#20ff00", "CREATE", 30, 21, 2, null, (playersMin, playersMax) => {
            Resources.ws.send(JSON.stringify({
                newRoom: "private",
                playersMin: playersMin,
                playersMax: playersMax
            }));
        }));

        this.buttons.push(new Button(new Vector2(this.center.x, this.center.y - 50 * activeCamera.zoom), 180, 40, "#ffb300", "PUBLIC", 30, 1, 4, () => Resources.owner && Resources.currentRoomID.includes("pub-"), () => {
            Resources.ws.send(JSON.stringify({
                updateRoom: Resources.currentRoomID,
                new: "priv-"
            }));
        }));
        this.buttons.push(new Button(new Vector2(this.center.x, this.center.y - 50 * activeCamera.zoom), 180, 40, "#00a2ff", "PRIVATE", 30, 1, 4, () => Resources.owner && Resources.currentRoomID.includes("priv-"), () => {
            Resources.ws.send(JSON.stringify({
                updateRoom: Resources.currentRoomID,
                new: "pub-"
            }));
        }));

        this.buttons.push(new Button(new Vector2(this.center.x, this.center.y + 50 * activeCamera.zoom), 180, 40, "#20ff00", "PLAY", 30, 1, 3, (playersMin) => Resources.owner && Resources.playerNum >= playersMin, () => {
            Resources.ws.send(JSON.stringify({
                startRoom: true,
                roomID: Resources.currentRoomID
            }));
        }));

        this.buttons.push(new Button(new Vector2(this.center.x, this.center.y + 50 * activeCamera.zoom), 180, 40, "#20ff00", "REMATCH", 30, 3, 3, () => this.source.testWin() !== -1 && (Resources.rematch.length !== Resources.playerNum || !Resources.rematch[Resources.order]), () => {
            Resources.ws.send(JSON.stringify({
                rematch: order
            }));
            if (Resources.rematch.length !== Resources.playerNum) {
                Resources.rematch = [];
                for (var i = 0; i < Resources.playerNum; i++) {
                    Resources.rematch.push(false);
                }
            }
            Resources.rematch[Resources.order] = true;
            var rematch = true;
            for (var i = 0; i < Resources.rematch.length; i++) {
                if (!Resources.rematch[i]) {
                    rematch = false;
                    break;
                }
            }
            if (rematch) {
                Resources.order++;
                Resources.order %= Resources.playerNum;
                this.source = Resources.createGame[this.title]();
            }
        }));
    }

    /**
     * Draws the game window to the screen
    */
   draw() {
        ctx.save();
        ctx.textAlign = 'center';
        for (var i = 0 ; i < this.buttons.length; i++) {
           this.buttons[i].draw(this.windowState, this.source.minPlayers); 
        }
        if (this.windowState === 3) {    
            var win = this.source.testWin();
            if (win !== -1) {
                this.source.winDisplay(win, this.origin, this.width);
            } else {
                this.source.display(this.windowState, this.source);
            }
        }
        ctx.fillStyle = "black";
        if (this.windowState === 1) {
            ctx.font = `${25 * activeCamera.zoom}px Arial`;
            ctx.fillText(Resources.currentRoomID.substring(Resources.currentRoomID.indexOf("-") + 1), this.origin.x + this.width / 2, this.origin.y + 100 * activeCamera.zoom);
        }
        ctx.font = `${30 * activeCamera.zoom}px Arial`;
        ctx.fillText(this.title, this.origin.x + this.width / 2, this.origin.y + 50 * activeCamera.zoom);
        ctx.restore();
    }
    
    /**
     * Processes clicks on the game window
     * @param {Vector2} position takes in the position of the mouse click
     * @returns {boolean} returns true if game window should close, false if otherwise
    */
    processClick(position) {
        if (this.buttons[0].processClick(position, (condition) => {return !condition;})) {
            // Returns true if the click happened outside of the menu and returns true to close the window
            return true;
        } else {
            // Start at index 1 and go through each button
            for (var i = 1; i < this.buttons.length; i++) {
                // Figures out if the button is even visible
                if (this.buttons[i].windowState === this.windowState && (this.buttons[i].extraCondition === null || this.buttons[i].extraCondition(this.source.minPlayers))) {
                    // Checks if the button was clicked and runs any code specific to the button
                    var nextState = this.buttons[i].processClick(position, (condition, nextState, windowState) => {
                        if (condition) {
                            return nextState;
                        } else {
                            return windowState;
                    }}, this.source.minPlayers, this.source.maxPlayers);

                    // Checks if the window state changed and if so change the state of the menu and return false
                    if (nextState !== this.windowState) {
                        this.windowState = nextState;
                        return false;
                    }
                }
            }

            if (this.source.buttons !== null) {
                for (var i = 0; i < this.source.buttons.length; i++) {
                    if (this.source.buttons[i].windowState === this.windowState && (this.source.buttons[i].extraCondition === null || this.source.buttons[i].extraCondition(this.source.minPlayers))) {
                        var nextState = this.source.buttons[i].processClick(position, (condition, nextState, windowState) => {
                            if (condition) {
                                return nextState;
                            } else {
                                return windowState;
                        }}, this.source.minPlayers, this.source.maxPlayers, this.source, i);
                    }
                }
            }

            // If mouse is outside of any valid buttons, return false
            return false;
        }
    }
}
    
class Button {
    width;
    height;
    origin;
    color;
    windowState;
    text;
    nextState;
    fontSize;
    process;
    
    /**
     * Game Window buttons that run a specified function on click
     * @param {Vector2} origin top left corner of the button
     * @param {number} width width of button
     * @param {number} height height of button
     * @param {string} color color of button
     * @param {string} text text on button
     * @param {string} fontSize the font size of the text
     * @param {number} state the state number of the game window when this button should draw
     * @param {number} nextState the state the game window should switch upon click 
     * @param {Function} processButton specialized code to run when pressed
     * @param extraCondition a function that tells the button to display when the specified condition is met
     */
    constructor(origin, width, height, color, text, fontSize, state, nextState, extraCondition, processButton = null) {
        this.width = width * activeCamera.zoom;
        this.height = height * activeCamera.zoom;
        this.origin = new Vector2(origin.x - this.width / 2, origin.y - this.height / 2);
        this.color = color;
        this.windowState = state;
        this.text = text;
        this.nextState = nextState;
        this.fontSize = fontSize;
        this.process = processButton;
        this.extraCondition = extraCondition;
    }

    /**
     * Draws the button if the game window state matches the button's state
     * @param {number} state checked against the button's state 
     */
    draw(state, playersMin) {
        if ((this.windowState === null || state === this.windowState) && (this.extraCondition === null || this.extraCondition(playersMin))) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.origin.x, this.origin.y, this.width, this.height);
            ctx.textAlign = 'center';
            ctx.fillStyle = "black";
            ctx.font = `${this.fontSize * activeCamera.zoom}px Arial`;
            ctx.fillText(this.text, this.origin.x + this.width / 2, this.origin.y + this.height / 2 + 10 * activeCamera.zoom);
        }
    }

    /**
     * 
     * @param {Vector2} position takes in the position of the mouse click
     * @param {Function} execute passed in function that determines what is done with the click
     * @returns returns output of the execute function
     */
    processClick(position, execute, min, max, game, index) {
        var input = document.getElementById("gameDiv");
        if (input !== null && this.windowState !== null) {
            input.remove();
        }
        var condition = position.x >= this.origin.x && position.y >= this.origin.y && position.x <= this.origin.x + this.width && position.y <= this.origin.y + this.height;
        
        if (condition && this.process !== null) {
            this.process(min, max, this, game, index);
        }
        return execute(condition, this.nextState, this.windowState);
    }
}