function createTicTacToe() {
    var gameBoard = new Board(3, 3);
    for (var i = 0; i < 3; i++) {
        gameBoard.setRow(i, [new Piece("")], () => true);
    }

    function moveCondition(inSpot, turn) {
        return inSpot.value === "" && Resources.order === turn;
    };

    const winCondition = (gameBoard, turn) => {
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

        for (var i = 0; i < 3; i++) {
            if (win === null) {
                win = getWinner(gameBoard.getRow(new Vector2(0, i), true));
            }
            if (win === null) {
                win = getWinner(gameBoard.getColumn(new Vector2(i, 0), true));
            }
        }

        var diags = [gameBoard.getDiagonal(new Vector2(0, 0), 1, 1), gameBoard.getDiagonal(new Vector2(2, 0), -1, 1)];
        if (win === null) {
            win = getWinner(diags[0]);
        }
        if (win === null) {
            win = getWinner(diags[1]);
        }

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
    var width = dimensions.x * activeCamera.zoom;
    var height = dimensions.y * activeCamera.zoom;
    var origin = new Vector2(canvas.width / 2 - width / 2, canvas.height / 2 - height / 2)
    var center = new Vector2(canvas.width / 2, canvas.height / 2);
    var buttons = [];
    
    for (var i = 0; i < 9; i++) {
        buttons.push(new Button(new Vector2(center.x + (-70 + (i % 3) * 70) * activeCamera.zoom, center.y + (-70 + Math.floor(i / 3) * 70) * activeCamera.zoom), 60, 60, "#7d7d7d", "", 30, 3, 3, null, (a, b, obj, game, index) => {
            if (game.testWin() === -1) { 
                var pos = new Vector2(index % 3, Math.floor(index / 3));
                game.gameBoard.setPos(pos, new Piece(game.turn === 0 ? "X": "O"), game.rules[1], game.turn);
                if (game.gameBoard.get(pos).value !== "" && game.gameBoard.get(pos).value === (game.turn === 0 ? "X": "O")) {
                    obj.text = game.gameBoard.get(pos).value;
                    game.switchTurn(Resources.playerNum);
                    Resources.ws.send(JSON.stringify({
                        gameMove: [index, obj.text],
                        id: userPlayer.username,
                        roomID: Resources.currentRoomID
                    }));
                    console.log(game.testWin());
                }
            }
        }));
    }

    const processMove = (move, obj) => {
        obj.gameBoard.set(new Vector2(move[0] % 3, Math.floor(move[0] / 3)), new Piece(move[1]));
        obj.buttons[move[0]].text = move[1];
        obj.switchTurn(Resources.playerNum);
        console.log(obj.testWin());
    }

    const winText = () => {
        
    }

    return new Game("Tic Tac Toe", 2, 2, gameBoard, dimensions, [winCondition, moveCondition], buttons, processMove);
}