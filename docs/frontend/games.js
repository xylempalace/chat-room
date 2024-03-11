class Board {

    board = [];
    rows;
    columns;

    constructor (r, c) {
        this.rows = r;
        this.columns = c;

        var emptyRow = [];
        for (var i = 0; i < c; i++) {
            emptyRow.push(null);
        }

        for (i = 0; i < r; i++) {
            this.board.push(emptyRow);
        }
        console.log(this.board);
    }
}