function createTicTacToe() {
    var gameBoard = new Board(3, 3);
    for (var i = 0; i < 3; i++) {
        gameBoard.setRow(i, [new Piece("")], () => true);
    }
    function moveCondition(inSpot) {
        return inSpot.value == "";
    };
    const winCondition = (gameBoard, players, turn) => {
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

    
    return new Game("Tic Tac Toe", 2, 2, gameBoard, new Vector2(800, 400), [winCondition, moveCondition]);
}