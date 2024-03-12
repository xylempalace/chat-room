class Board {

    board = [];
    rows;
    columns;

    constructor (r, c) {
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

    set(pos, obj, condition) {
        if (condition()) {
            this.board[pos.x][pos.y] = obj;
        }
        console.log(this.board);
    }
}