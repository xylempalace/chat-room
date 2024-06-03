function createTicTacToe() {
    // Creates a new tic tac toe game object

    // Makes the game board
    var gameBoard = new Board(3, 3);
    for (var i = 0; i < 3; i++) {
        gameBoard.setRow(i, [new Piece("")], () => true);
    }

    // Rule determining if a move is valid
    function moveCondition(inSpot, turn) {
        return inSpot.value === "" && Resources.order === turn;
    };

    // Checks if a player has won or the game is a tie
    const winCondition = (gameBoard, turn) => {
        // Checks an array for if X (0) is in every spot or O (1)
        const getWinner = arr => {
            if (arr.every(val => val.value === arr[0].value)) {
                if (arr[0].value == "X") {
                    return 0;
                } else if (arr[0].value == "O") {
                    return 1;
                }
            }
            return null;
        };
        var win = null;

        // Checks all rows and columns
        for (var i = 0; i < 3; i++) {
            if (win === null) {
                win = getWinner(gameBoard.getRow(new Vector2(0, i), true));
            }
            if (win === null) {
                win = getWinner(gameBoard.getColumn(new Vector2(i, 0), true));
            }
        }

        // Checks all diagonals
        var diags = [gameBoard.getDiagonal(new Vector2(0, 0), 1, 1), gameBoard.getDiagonal(new Vector2(2, 0), -1, 1)];
        if (win === null) {
            win = getWinner(diags[0]);
        }
        if (win === null) {
            win = getWinner(diags[1]);
        }

        // Determines if the game is a tie or not; no winner: -1, tie: 2
        if (win === null) {
            win = 2;
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 3; j++) {
                    if (gameBoard.get(new Vector2(i, j)).value == "") {
                        win = -1;
                    }
                }
            }
        }
        return win;
    };

    const canvas = document.getElementById("gameCanvas");
    var dimensions = new Vector2(800, 400);
    var center = new Vector2(canvas.width / 2, canvas.height / 2);
    var buttons = [];
    
    for (var i = 0; i < 9; i++) {
        // Makes all buttons for the game
        buttons.push(new Button(new Vector2(center.x + (-70 + (i % 3) * 70) * activeCamera.zoom, center.y + (-70 + Math.floor(i / 3) * 70) * activeCamera.zoom), 60, 60, "#7d7d7d", "", 30, 3, 3, null, (a, b, obj, game, index) => {
            if (game.testWin() === -1) { 
                // Tests if the game is still active and makes the move if possible
                var pos = new Vector2(index % 3, Math.floor(index / 3));
                game.gameBoard.setPos(pos, new Piece(game.turn === 0 ? "X": "O"), game.rules[1], game.turn);

                if (game.gameBoard.get(pos).value !== "" && game.gameBoard.get(pos).value === (game.turn === 0 ? "X": "O")) {
                    // Sends the move to opponent if vaild
                    obj.text = game.gameBoard.get(pos).value;
                    game.switchTurn(Resources.playerNum);
                    Resources.ws.send(JSON.stringify({
                        gameMove: [index, obj.text],
                        id: userPlayer.username,
                        roomID: Resources.currentRoomID
                    }));
                }
            }
        }));
    }

    const processMove = (move, obj) => {
        // Deals with incoming moves from opponent
        obj.gameBoard.set(new Vector2(move[0] % 3, Math.floor(move[0] / 3)), new Piece(move[1]));
        obj.buttons[move[0]].text = move[1];
        obj.switchTurn(Resources.playerNum);
    }

    const renderButtons = (windowState, game) => {
        // Draws buttons to screen
        for (var i = 0 ; i < game.buttons.length; i++) {
            game.buttons[i].draw(windowState, game.minPlayers); 
         }
    }

    const winText = (win, origin, width) => {
        // Displays the winner of the game
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(origin.x + width / 2 - 75 * activeCamera.zoom, origin.y + (200 - 28) * activeCamera.zoom, 150 * activeCamera.zoom, 40 * activeCamera.zoom);
        ctx.fillStyle = "black";
        ctx.font = `${25 * activeCamera.zoom}px Arial`;
        ctx.fillText((win === 2 ? "Tie" : (win === 0 ? "X wins" : "O wins")), origin.x + width / 2, origin.y + 200 * activeCamera.zoom);   
    }
    
    // Returns the finished tic tac toe game object
    return new Game("Tic Tac Toe", 2, 2, gameBoard, null, dimensions, [winCondition, moveCondition], buttons, processMove, renderButtons, winText);
}