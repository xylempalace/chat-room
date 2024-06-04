function createConnect4(){
    var gameBoard = new Board(6,7);
for (var i = 0; i < 6; i++){
    gameBoard.setRow(i, [new Piece(0)], () => true);
}

function moveCondition(inSpot, turn){
return inSpot.value === 0 && Resources.order === turn;

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

// In gameBoard, 1 is red and 2 is yellow. 
    for (var i = 0; i < 7; i++){
        let b = new Button(new Vector2(center.x + (-150 + i* 50)*activeCamera.zoom, center.y + -220 * activeCamera.zoom),40, 450, "#FFB6C1","",0,3,3,null, (a, b, obj, game, index) => {
            console.log("Button " + b + "has been pressed");
            let col = game.gameBoard.getColumn(new Vector2(index, 6), false);
            let count = 0;


           while (col[count].value !== 0){
                count++;
            }

            let pos = new Vector2(index, 5-count);

            game.gameBoard.setPos(pos, new Piece(game.turn === 0 ? 1 : 2),game.rules[1], game.turn);
           console.log("THe new board value is: " + game.gameBoard.get(pos).value);
            if (game.gameBoard.get(pos).value !== 0 && game.gameBoard.get(pos).value === (game.turn === 0 ? 1: 2)) {
                game.switchTurn(Resources.playerNum);
                Resources.ws.send(JSON.stringify({
                    gameMove: [pos.x,pos.y,game.gameBoard.get(pos).value],
                    id: userPlayer.username,
                    roomID: Resources.currentRoomID
                }));
                console.log("Success!");
                console.log("Player is sending a value of: " + game.gameBoard.get(pos).value);
            }
            
        });
    
        buttons.push(b);    
    } 
    const displayBoard = (windowState, game) => {
        for (var i = 0 ; i < game.buttons.length; i++) {
            game.buttons[i].draw(windowState, game.minPlayers); 
         }
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.fillRect(center.x -180 * activeCamera.zoom, center.y - 140 * activeCamera.zoom, 550,450);
        for(var x = 0; x < 7; x++){
            for( var y = 0; y < 6; y++){
                if (gameBoard.get(new Vector2(x,y)).value === 0) {
                    ctx.fillStyle = "white";
                } else if(gameBoard.get(new Vector2(x,y)).value === 1) {
                    ctx.fillStyle = "red";
                }

                else{
             
                    ctx.fillStyle = "yellow";
                }
                ctx.beginPath();
                ctx.moveTo(center.x + (-300 + x * 100) * .5 * activeCamera.zoom, center.y + (-230 + y * 100) * activeCamera.zoom * .5);
                ctx.arc(center.x + (-300 + x * 100) * .5 * activeCamera.zoom, center.y + (-230 + y * 100) * activeCamera.zoom * .5, 20    , 0, 2* Math.PI, false);
                ctx.fill();
            }
        }        
    }




const processMove = (move,obj) => {
    console.log("X is :" + move[0] + "Y is: " + move[1]);
    let val = new Piece;
    val.value = move[2] 
obj.gameBoard.set(new Vector2(move[0],move[1]),val);
console.log("The value of recived vector is: " + obj.gameBoard.get(new Vector2(move[0],move[1])).value);
obj.switchTurn(Resources.playerNum);
console.log("The player recieved a value of: " + move[2]);

}

    const winText = (win,origin, width) => {


    }


return new Game("Connect Four", 2, 2, gameBoard, new Vector2(800, 400), [winCondition, moveCondition], buttons, processMove,displayBoard,winText);

}
