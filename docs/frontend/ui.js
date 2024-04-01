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
    setPos(pos, obj, condition) {
        if (condition(this.get(pos))) {
            this.set(pos, obj);
        }
    }

    /**
     * Moves an object from one spot to another
     * @param {Vector2} fromPos the position of the object to be moved
     * @param {Vector2} toPos the destination of the moving object
     * @param condition the function that determines whether or not to move the object
     */
    move(fromPos, toPos, condition) {
        if (condition(this.get(fromPos), this.get(toPos))) {
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
    swap(fromPos, toPos, condition) {
        if (condition(this.get(fromPos), this.get(toPos))) {
            var temp = this.get(toPos);
            this.set(toPos, this.get(fromPos));
            this.set(fromPos, temp);
        }
    }

    setRow(row, objs, condition) {
        for (var i = 0; i < this.columns; i++) {
            if (condition(this.get(new Vector2(i, row)))) {
                this.set(new Vector2(i, row), objs[i % objs.length]);
            }
        }
    }

    setColumn(column, objs, condition) {
        for (var i = 0; i < this.rows; i++) {
            if (condition(this.get(new Vector2(column, i)))) {
                this.set(new Vector2(column, i), objs[i % objs.length]);
            }
        }
    }
}

class Piece {
    value;

    constructor(value) {
        this.value = value;
    }
}

class Deck {
    cards = [];
    cardTypes = [];

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

    shuffle() {
        newDeck = [];
        while (this.cards.length > 0) {
            var i = Math.floor(Math.random()) * this.cards.length;
            newDeck.push(this.cards[i]);
            delete this.cards[i];
        }
        this.cards = newDeck;
    }

    draw() {
        returnCard = this.cards[0];
        delete this.cards[0];
        return returnCard;
    }
}

class Card {
    value;
    amountInDeck;

    constructor(value, amountInDeck) {
        this.value = value;
        this.amountInDeck = amountInDeck;
    }
}

class Game {
    title;
    maxPlayers;
    players;
    minPlayers;
    gameBoard;
    deck;
    turn = 0;
    dimensions;

    constructor(title, maxPlayers, minPlayers, board, dimensions) {
        this.title = title;
        this.maxPlayers = maxPlayers;
        this.minPlayers = minPlayers;
        this.gameBoard = board;
        this.dimensions = dimensions;
    }

    startGame(players) {
        this.players = players;
    }

    switchTurn() {
        turn++;
        turn %= this.players;
    }

    testWin(rules) {
        return rules(this.board, this.players, this.turn);
    }
}

class GameProp extends Prop {
    interactionRange;
    game;
    window;
    drawMenu = false;

    constructor(sprite, pos, offset, size, interactionRange, game) {
        super(sprite, pos, offset, size);

        this.interactionRange = interactionRange;
        this.game = game;
        this.window = new GameMenu(this.game);
    }

    interactPrompt(pos) {
        var display = distance(pos.x, this.pos.x + this.drawOffset.x, pos.y, this.pos.y + this.drawOffset.y) <= this.interactionRange;
        const canvas = document.getElementById("gameCanvas");
        if (!this.drawMenu && display) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.fillStyle = "white";
            ctx.fillRect(canvas.width / 2 - 175, canvas.height - 45, 350, 40)
            ctx.fillStyle = "black";
            ctx.fillText("PRESS SPACE TO PLAY", canvas.width / 2, canvas.height - 15);
            ctx.restore();
        }
        return display;
    }
}

class Menu {
    source;
    title;
    maxPlayers;
    minPlayers;
    buttons = [];
    width;
    height;
    origin;
    windowState = 0;

    constructor(source) {
        this.source = source;
        this.title = source.title;
        this.maxPlayers = source.maxPlayers;
        this.minPlayers = source.minPlayers;
        this.width = source.dimensions.x * activeCamera.zoom;
        this.height = source.dimensions.y * activeCamera.zoom;
        const canvas = document.getElementById("gameCanvas");
        this.origin = new Vector2(canvas.width / 2 - this.width / 2, canvas.height / 2 - this.height / 2);
        this.buttons.push(new Button(this.origin, this.width, this.height, "#cacaca", null, ""));
        this.buttons.push(new Button(new Vector2(this.origin.x + this.width / 2 - 50, this.origin.y + this.height / 2 - 20), 100, 40, "#20ff00", 0, "PLAY", 1));
    }

    /**
     * Draws the game window to the screen
     */
    draw() {
        ctx.save();
        for (var i = 0 ; i < this.buttons.length; i++) {
            this.buttons[i].draw(this.windowState); 
        }
        ctx.textAlign = 'center';
        ctx.fillStyle = "black";
        ctx.fillText(this.title, this.origin.x + this.width / 2, this.origin.y + 50);
        ctx.restore();
    }

    /**
     * Processes clicks on the game window
     * @param {Vector2} position takes in the position of the mouse click
     * @returns {boolean} returns true if game window should close, false if otherwise
     */
    processClick(position) {
        if (this.buttons[0].processClick(position, (condition) => {return !condition;})) {
            return true;
        } else {
            for (var i = 1; i < this.buttons.length; i++) {
                if (this.buttons[i].windowState === this.windowState) {
                    this.windowState = this.buttons[i].processClick(position, (condition, nextState, windowState) => {
                    if (condition) {
                        return nextState;
                    } else {
                        return windowState;
                    }
                });
                }
            }
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

    /**
     * Game Window buttons that run a specified function on click
     * @param {Vector2} origin top left corner of the button
     * @param {number} width width of button
     * @param {number} height height of button
     * @param {string} color color of button
     * @param state the state number of the game window when this button should draw
     * @param {string} text text on button
     * @param nextState the state the game window should switch upon click
     */
    constructor(origin, width, height, color, state, text, nextState) {
        this.width = width;
        this.height = height;
        this.origin = origin;
        this.color = color;
        this.windowState = state;
        this.text = text;
        this.nextState = nextState;
    }

    /**
     * Draws the button if the game window state matches the button's state
     * @param {number} state checked against the button's state 
     */
    draw(state) {
        if (this.windowState === null || state === this.windowState) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.origin.x, this.origin.y, this.width, this.height);
            ctx.textAlign = 'center';
            ctx.fillStyle = "black";
            ctx.fillText(this.text, this.origin.x + this.width / 2, this.origin.y + this.height / 2 + 10);
        }
    }

    /**
     * 
     * @param {Vector2} position takes in the position of the mouse click
     * @param execute passed in function that determines what is done with the click
     * @returns returns output of the execute function
     */
    processClick(position, execute) {
        return execute(position.x >= this.origin.x && position.y >= this.origin.y && position.x <= this.origin.x + this.width && position.y <= this.origin.y + this.height, this.nextState, this.windowState);
    }
}