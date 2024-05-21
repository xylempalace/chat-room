function createConnect4(){
    var gameBoard = new Board(6,7);

for (var i = 0; i < 6; i++){

    gameBoard.setRow(i, [new Piece("")], () => true);
}

function moveCondition(inSpot, turn){
return inSpot.value === "" && Resources.order === turn;

} 

const winCondition = (gameBoard, turn) => {
}

const canvas = document.getElementById("gameCanvas");
    var dimensions = new Vector2(800, 400);
    var width = dimensions.x * activeCamera.zoom;
    var height = dimensions.y * activeCamera.zoom;
    var origin = new Vector2(canvas.width / 2 - width / 2, canvas.height / 2 - height / 2)
    var center = new Vector2(canvas.width / 2, canvas.height / 2);
    var buttons = [];














return new Game("Connect Four", 2, 2, gameBoard, new Vector2(800, 400));

}
