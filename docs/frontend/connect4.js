function createConnect4(){
    var gameBoard = new Board(6,7);

for (var i = 0; i < 6; i++){
    gameBoard.setRow(i, [new Piece(0)], () => true);
}

function moveCondition(inSpot, turn){
return inSpot.value === "" && Resources.order === turn;

} 

const winCondition = (gameBoard, turn) => {

    ;
}




const canvas = document.getElementById("gameCanvas");
    var dimensions = new Vector2(800, 400);
    var width = dimensions.x * activeCamera.zoom;
    var height = dimensions.y * activeCamera.zoom;
    var origin = new Vector2(canvas.width / 2 - width / 2, canvas.height / 2 - height / 2)
    var center = new Vector2(canvas.width / 2, canvas.height / 2);
    var buttons = [];


    for (var i = 0; i < 7; i++){
        let b = new Button(new Vector2(center.x + (-150 + i* 50)*activeCamera.zoom, center.y + -220 * activeCamera.zoom),40, 450, "#FFB6C1","",0,3,3,null, null);
        buttons.push(b);
    } 
    const displayBoard = (windowState, game) => {
        for (var i = 0 ; i < game.buttons.length; i++) {
            console.log("Button " + i + "has been drawned");
            game.buttons[i].draw(windowState, game.minPlayers); 
         }
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.fillRect(center.x -180 * activeCamera.zoom, center.y - 140 * activeCamera.zoom, 550,450);
        for(var x = 0; x < 7; x++){
            for( var y = 0; y < 6; y++){
                if (gameBoard.get(new Vector2(x,y)).value == 0) {
                    ctx.fillStyle = "white";
                } else if(gameBoard.get(new Vector2(x,y)).value == 1) {
                    ctx.fillStyle = "red";
                }

                else{
                    ctx.fillStyle = "blue";
                }

                ctx.moveTo(center.x + (-300 + x * 100) * .5 * activeCamera.zoom, center.y + (-230 + y * 100) * activeCamera.zoom * .5);
                ctx.arc(center.x + (-300 + x * 100) * .5 * activeCamera.zoom, center.y + (-230 + y * 100) * activeCamera.zoom * .5, 20    , 0, 2* Math.PI, false);
                ctx.fill();
            }
        }        
    }




const processMove = (move,obj) => {
obj.gameBoard.getColumn()



}

    const winText = (win,origin, width) => {


    }


return new Game("Connect Four", 2, 2, gameBoard, new Vector2(800, 400), [winCondition], buttons, processMove,displayBoard,winText);

}
