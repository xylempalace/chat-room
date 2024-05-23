function createConnect4(){
    var gameBoard = new Board(6,7);

for (var i = 0; i < 6; i++){
    gameBoard.setRow(i, [new Piece(0)], () => true);
}

function moveCondition(inSpot, turn){
return inSpot.value === "" && Resources.order === turn;

} 

const winCondition = (gameBoard, turn) => {

    return -1;
}

const canvas = document.getElementById("gameCanvas");
    var dimensions = new Vector2(800, 400);
    var width = dimensions.x * activeCamera.zoom;
    var height = dimensions.y * activeCamera.zoom;
    var origin = new Vector2(canvas.width / 2 - width / 2, canvas.height / 2 - height / 2)
    var center = new Vector2(canvas.width / 2, canvas.height / 2);
    var buttons = [];

for (var i = 0; i < 9; i++){
   // buttons.push(new Button(new Vector2(center.x + (-70 + (i % 3) * 70) * activeCamera.zoom, center.y + (-70 + Math.floor(i / 3) * 70) * activeCamera.zoom), 60, 60, "#7d7d7d", "", 30, 3, 3, null, (a, b, obj, game, index) => {

    }

    const displayBoard = (a, game) => {
        console.log("displayBoard called");
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.fillRect(center.x -200 * activeCamera.zoom, center.y - 140 * activeCamera.zoom, 550,400);
        ctx.fillStyle = "white";

        for(var x = 0; x < 7; x++){
            for( var y = 0; y < 6; y++){
                if (game.gameBoard) {

                }

                ctx.moveTo(center.x + (-300 + x * 100) * .5 * activeCamera.zoom, center.y + (-230 + y * 100) * activeCamera.zoom * .5);
                ctx.arc(center.x + (-300 + x * 100) * .5 * activeCamera.zoom, center.y + (-230 + y * 100) * activeCamera.zoom * .5, 20    , 0, 2* Math.PI, false);
                ctx.fill();
            }
        }        
    }










return new Game("Connect Four", 2, 2, gameBoard, new Vector2(800, 400), [winCondition], null, null,displayBoard);

}
