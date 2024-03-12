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

    get(pos) {
        return this.board[pos.y][pos.x];
    }

    getRow(pos, right) {
        if (right) {
            return this.board[pos.y].slice(pos.x, this.board[pos.y].length);
        } else {
            return this.board[pos.y].slice(0, pos.x + 1).reverse();
        }
    }

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

    set(pos, obj) {
        this.board[pos.y][pos.x] = obj;
    }

    setPos(pos, obj, condition) {
        if (condition(this.get(pos))) {
            this.set(pos, obj);
        }
    }

    move(fromPos, toPos, condition) {
        if (condition(this.get(fromPos), this.get(toPos))) {
            this.set(toPos, this.get(fromPos));
            this.set(fromPos, null);
        }
    }

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