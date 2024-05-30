function createUno() {
    var gameDeck = new Deck();

    const canvas = document.getElementById("gameCanvas");
    var dimensions = new Vector2(800, 400);
    var center = new Vector2(canvas.width / 2, canvas.height / 2);
    var buttons = [];

    const renderGame = () => {
        
    }
    
    return new Game("Uno", 2, 2, null, gameDeck, dimensions, [], buttons, null, renderGame);
}