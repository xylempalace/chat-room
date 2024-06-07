
// Script used to send index.html in response to HTTP request

// Import express library and declare it as var app
const express = require('express')
const app = express()
const { WebSocketServer } = require('ws')
const http = require('http');

const sockserver = new WebSocketServer({ clientTracking: true, noServer: true })

// Creates a unique uid
sockserver.getUniqueID = function () {
  function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4();
};
sockserver.getUniqueRoomID = function () {
  return Math.floor((1 + Math.random()) * 0x100000).toString(16).substring(1);
};

const port = 3000
// Import path library
const path = require('path')

const {
	RegExpMatcher,
	TextCensor,
	englishDataset,
	englishRecommendedTransformers,
  asteriskCensorStrategy, 
} = require('obscenity');
const matcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});

const strategy = asteriskCensorStrategy();  
const censor = new TextCensor().setStrategy(strategy);

// All files that are used and their corresponding urls and mimi types
const files = {
  '/' : ['text/html', '../frontend/index.html'],
  '/web.css' : ['text/css', '../frontend/web.css'],
  '/test.js' : ['text/javascript', '../frontend/test.js'],
  '/favicon.ico' : ['image/vnd.microsoft.icon', '../images/favicon.ico'],
  '/lemEngine.js' : ['text/javascript', '../frontend/lemEngine.js'],
  '/ui.js' : ['text/javascript', '../frontend/ui.js'],
  '/tictactoe.js' : ['text/javascript', '../frontend/tictactoe.js'],
  '/connect4.js' : ['text/javascript', '../frontend/connect4.js'],
  '/imageManipulator.js' : ['text/javascript', '../tools/imageTools/imageManipulator.js'],

  // Tiles
  '/sprites/tiles/floor.png' : ['image/png', '../frontend/sprites/tiles/floor.png'],
  '/sprites/tiles/wall.png' : ['image/png', '../frontend/sprites/tiles/wall.png'],
  '/sprites/tiles/grass.png' : ['image/png', '../frontend/sprites/tiles/grass.png'],

  // Path
    '/sprites/tiles/pathCenter.png' : ['image/png', '../frontend/sprites/tiles/pathCenter.png'],
    '/sprites/tiles/pathNorth.png' : ['image/png', '../frontend/sprites/tiles/pathNorth.png'],
    '/sprites/tiles/pathSouth.png' : ['image/png', '../frontend/sprites/tiles/pathSouth.png'],
    '/sprites/tiles/pathEast.png' : ['image/png', '../frontend/sprites/tiles/pathEast.png'],
    '/sprites/tiles/pathWest.png' : ['image/png', '../frontend/sprites/tiles/pathWest.png'],
    '/sprites/tiles/pathNone.png' : ['image/png', '../frontend/sprites/tiles/pathNone.png'],
    '/sprites/tiles/pathNorthEast.png' : ['image/png', '../frontend/sprites/tiles/pathNorthEast.png'],
    '/sprites/tiles/pathNorthWest.png' : ['image/png', '../frontend/sprites/tiles/pathNorthWest.png'],
    '/sprites/tiles/pathSouthEast.png' : ['image/png', '../frontend/sprites/tiles/pathSouthEast.png'],
    '/sprites/tiles/pathSouthWest.png' : ['image/png', '../frontend/sprites/tiles/pathSouthWest.png'],
    '/sprites/tiles/pathNorthEastInner.png' : ['image/png', '../frontend/sprites/tiles/pathNorthEastInner.png'],
    '/sprites/tiles/pathNorthWestInner.png' : ['image/png', '../frontend/sprites/tiles/pathNorthWestInner.png'],
    '/sprites/tiles/pathSouthEastInner.png' : ['image/png', '../frontend/sprites/tiles/pathSouthEastInner.png'],
    '/sprites/tiles/pathSouthWestInner.png' : ['image/png', '../frontend/sprites/tiles/pathSouthWestInner.png'],
    '/sprites/tiles/pathEastWest.png' : ['image/png', '../frontend/sprites/tiles/pathEastWest.png'],
    '/sprites/tiles/pathNorthSouth.png' : ['image/png', '../frontend/sprites/tiles/pathNorthSouth.png'],
    '/sprites/tiles/pathAtlas.png' : ['image/png', '../frontend/sprites/tiles/pathAtlas.png'],

  // Cliff
    '/sprites/tiles/cliff.png' : ['image/png', '../frontend/sprites/tiles/cliff.png'],
    '/sprites/tiles/cliffNorth.png' : ['image/png', '../frontend/sprites/tiles/cliffNorth.png'],
    '/sprites/tiles/cliffSouth.png' : ['image/png', '../frontend/sprites/tiles/cliffSouth.png'],
    '/sprites/tiles/cliffEast.png' : ['image/png', '../frontend/sprites/tiles/cliffEast.png'],
    '/sprites/tiles/cliffWest.png' : ['image/png', '../frontend/sprites/tiles/cliffWest.png'],
    '/sprites/tiles/cliffNone.png' : ['image/png', '../frontend/sprites/tiles/cliffNone.png'],
    '/sprites/tiles/cliffNorthEast.png' : ['image/png', '../frontend/sprites/tiles/cliffNorthEast.png'],
    '/sprites/tiles/cliffNorthWest.png' : ['image/png', '../frontend/sprites/tiles/cliffNorthWest.png'],
    '/sprites/tiles/cliffSouthEast.png' : ['image/png', '../frontend/sprites/tiles/cliffSouthEast.png'],
    '/sprites/tiles/cliffSouthWest.png' : ['image/png', '../frontend/sprites/tiles/cliffSouthWest.png'],
    '/sprites/tiles/cliffNorthEastInner.png' : ['image/png', '../frontend/sprites/tiles/cliffNorthEastInner.png'],
    '/sprites/tiles/cliffNorthWestInner.png' : ['image/png', '../frontend/sprites/tiles/cliffNorthWestInner.png'],
    '/sprites/tiles/cliffSouthEastInner.png' : ['image/png', '../frontend/sprites/tiles/cliffSouthEastInner.png'],
    '/sprites/tiles/cliffSouthWestInner.png' : ['image/png', '../frontend/sprites/tiles/cliffSouthWestInner.png'],
    '/sprites/tiles/cliffNorthWestSouthEastInner.png' : ['image/png', '../frontend/sprites/tiles/cliffNorthWestSouthEastInner.png'],

  '/sprites/speechBubble.png' : ['image/png', '../frontend/sprites/speechBubble.png'],
  '/sprites/speechBubbleOther.png' : ['image/png', '../frontend/sprites/speechBubbleOther.png'],
  '/sprites/bg.png' : ['image/png', '../frontend/sprites/bg_sky.png'],
  '/sprites/bg2.png' : ['image/png', '../frontend/sprites/bg_sky2.png'],

  // Props
  '/sprites/tree.png' : ['image/png', '../frontend/sprites/tree.png'],
  '/sprites/tree2.png' : ['image/png', '../frontend/sprites/tree2.png'],
  '/sprites/minigame/tictactoe/tictactoeBoardInteract.png' : ['image/png', '../frontend/sprites/minigame/tictactoe/tictactoeBoardInteract.png'],
  '/sprites/minigame/connect4/connect4BoardInteract.png' : ['image/png', '../frontend/sprites/minigame/connect4/connect4BoardInteract.png'],
  '/sprites/pillar_1.png' : ['image/png', '../frontend/sprites/pillar_1.png'],
  '/sprites/pillar_2.png' : ['image/png', '../frontend/sprites/pillar_2.png'],
  '/sprites/pillar_3.png' : ['image/png', '../frontend/sprites/pillar_3.png'],
  '/sprites/pillar_4.png' : ['image/png', '../frontend/sprites/pillar_4.png'],

  //Player
  '/sprites/player/base.png' : ['image/png', '../frontend/sprites/player/base.png'],
  '/sprites/player/sit.png' : ['image/png', '../frontend/sprites/player/sit.png'],
  '/sprites/player/fedora.png' : ['image/png', '../frontend/sprites/player/fedora.png'],
  '/sprites/player/flower.png' : ['image/png', '../frontend/sprites/player/flower.png'],
  '/sprites/player/big_glasses.png' : ['image/png', '../frontend/sprites/player/big_glasses.png'],
  '/sprites/player/horns.png' : ['image/png', '../frontend/sprites/player/horns.png'],
  '/sprites/player/tail.png' : ['image/png', '../frontend/sprites/player/tail.png'],
  '/sprites/player/lil_glasses.png' : ['image/png', '../frontend/sprites/player/lil_glasses.png'],
  '/sprites/player/sun_glasses.png' : ['image/png', '../frontend/sprites/player/sun_glasses.png'],
  '/sprites/player/party_hat.png' : ['image/png', '../frontend/sprites/player/party_hat.png'],

};

var clients = {};
var gameRooms = {};

// Serves corresponding file upon request
app.get('/*', (req, res) => {
  try {
    var stuff = files[req.url];
    res.set('Content-Type', stuff[0]);
    res.sendFile(path.join(__dirname, stuff[1]));
  } catch (err) {
    console.log(req.url);
    console.log(err);
  }
});

// Socket Server Code
sockserver.on('connection', (ws, req) => {
  console.log(`New client connected with IP ${req.socket.remoteAddress}`); 

  ws.on('close', () => {
    // When the client disconnects it sends its username to other clients so they know to remove that player from their screen
    try {
      if (clients[ws.id] !== undefined) {
        console.log(`${clients[ws.id][0]}(${ws.id}) has disconnected!`);
        sockserver.clients.forEach(client => {
          client.send(JSON.stringify({
            id: clients[ws.id][0],
            expired: true
          })); 
        });
        delete clients[ws.id];
      } else {
        console.log("Client without account disconnected");
      }
      var del = null;
      for (const [key, value] of Object.entries(gameRooms)) {
        // Finds which room the player is in and removes them
        for (var i = 0; i < value[0].length; i++) {
          if (value[0][i] === ws.id) {
            value[0] = removeFromArray(value[0], i);
            del = key;
          }
        }
      }
      if (del !== null) {
        if (gameRooms[del][0].length <= 0) {
          // Deletes room if its empty
          delete gameRooms[del];
        } else if (gameRooms[del][3]) {
          // Kicks other players out of the room if the game is already started
          sockserver.clients.forEach(client => {
            for (var i = 0; i < gameRooms[del][0].length; i++) {
              if (client.id === gameRooms[del][0][i]) {
                client.send(JSON.stringify({
                  kick: true
                }));
              }
            }
          });
        } else {
          // Changes the owner of the room if the owner was the player who left
          sockserver.clients.forEach(client => {
            if (client.id === gameRooms[del][0][0]) {
              client.send(JSON.stringify({
                owner: true
              }));
            }

            // Updates all the players in the room of the new player count
            for (var i = 0; i < gameRooms[del][0].length; i++) {
              if (client.id === gameRooms[del][0][i]) {
                client.send(JSON.stringify({
                  playerNum: gameRooms[del][0].length,
                  order: i
                }));
              }
            }
          });
        }
      }
    } catch (e) {
      console.log("Disconnect failed! Error:");
      console.log(e);
    }
  });

  ws.on('message', (str) => {
    // Handles recieving data from clients
    var obj = JSON.parse(str);
  
    if ("posX" in obj) {
      // This code handles recieving and distributing positional data from one client to the others
      if (clients[ws.id] !== undefined) {
        clients[ws.id][1] = obj.posX;
        clients[ws.id][2] = obj.posY;
        sockserver.clients.forEach(client => {
          client.send(JSON.stringify({
            id: obj.id,
            posX: obj.posX,
            posY: obj.posY,
            flipped: obj.flipped
          }));
        });
      }
    } else if ("msg" in obj) {
      // When a message is sent this code distributes that message to other clients
      sockserver.clients.forEach(client => {
        if (clients[ws.id] !== undefined && distance(clients[client.id][1], clients[ws.id][1], clients[client.id][2], clients[ws.id][2]) < 700) {
          const matches = matcher.getAllMatches(obj.msg);
          var newmsg = (censor.applyTo(obj.msg, matches));
          obj.msg = newmsg; 
          console.log(`distributing message: ${obj.msg}`);
          client.send(JSON.stringify({
            id: obj.id,
            msg: obj.msg
          }));
        }
      });
    } else if ("newRoom" in obj) {
      // When a new game room is created
      var gameID;
      var cond;
      while (cond !== true) {
        // Creates a new room ID and checks if it already exists
        cond = true;
        gameID = `${sockserver.getUniqueRoomID()}`;
        for (const [key, value] of Object.entries(gameRooms)) {
          if (key.includes(gameID)) {
            cond = false;
          }
        }
      }

      gameID = `${obj.newRoom == "public" ? "pub-" : "priv-"}${gameID}`;
      // Room created with its ID, then the id off the creator in a list as well as the min and max amt of players allowed in the room
      gameRooms[gameID] = [[ws.id], obj.playersMin, obj.playersMax, false];
      console.log(`New room created with game ID: ${gameID}`);

      // Notifies the client of the newly created room
      ws.send(JSON.stringify({
        joinRoom: gameID,
        owner: true,
        playerNum: gameRooms[gameID][0].length,
        order: 0
      }));
    } else if ("leaveRoom" in obj) {  
      // Handles leaving game rooms
      try {
        for (var i = 0; i < gameRooms[obj.leaveRoom][0].length; i++) {
          // Finds which room the player is in and removes them
          if (ws.id === gameRooms[obj.leaveRoom][0][i]) {
            delete gameRooms[obj.leaveRoom][0].splice(i, 1);
            break;
          }
        }
        if (gameRooms[obj.leaveRoom][0].length <= 0) {
          // Deletes room if its empty
          delete gameRooms[obj.leaveRoom];
        } else if (gameRooms[obj.leaveRoom][3]) {
          // Kicks other players out of the room if the game is already started
          sockserver.clients.forEach(client => {
            for (var i = 0; i < gameRooms[obj.leaveRoom][0].length; i++) {
              if (client.id === gameRooms[obj.leaveRoom][0][i]) {
                client.send(JSON.stringify({
                  kick: true
                }));
              }
            }
          });
        } else {
          // Changes the owner of the room if the owner was the player who left
          sockserver.clients.forEach(client => {
            if (client.id === gameRooms[obj.leaveRoom][0][0]) {
              client.send(JSON.stringify({
                owner: true
              }));
            }

            // Updates all the players in the room of the new player count
            for (var i = 0; i < gameRooms[obj.leaveRoom][0].length; i++) {
              if (client.id === gameRooms[obj.leaveRoom][0][i]) {
                client.send(JSON.stringify({
                  playerNum: gameRooms[obj.leaveRoom][0].length,
                  order: i
                }));
              }
            }
          });
        }
      } catch(err) {
        console.log(err);
      }
    } else if ("joinRoom" in obj) {
      // Handles players joining rooms
      var privacy;
      if (obj.joinRoom === null) {
        for (const [key, value] of Object.entries(gameRooms)) {
          // Finds the first available public room to join
          if (key.includes("pub-") && value[0].length < value[2] && !value[3]) {
            value[0].push(ws.id);
            ws.send(JSON.stringify({
              joinRoom: key,
              owner: false
            }));

            // Updates the player count of all players in the room
            for (var i = 0; i < value[0].length; i++) {
              sockserver.clients.forEach(client => {
                if (client.id === value[0][i]) {
                  client.send(JSON.stringify({
                    playerNum: value[0].length,
                    order: i
                  }));
                }
              });
            }
            return;
          }
        }

        // Sends an error if the game is full
        ws.send(JSON.stringify({
          joinRoom: "error"
        }));
      } else if ("pub-" + obj.joinRoom in gameRooms) {
        // Adds the player to the specified room if its public
        privacy = "pub-";
        var room = gameRooms[privacy + obj.joinRoom];
        if (room[0].length < room[2] && !room[3]) {
          room[0].push(ws.id)
          ws.send(JSON.stringify({
            joinRoom: privacy + obj.joinRoom,
            owner: false
          }));

          // Updates the player count of all players in the room
          for (var i = 0; i < room[0].length; i++) {
            sockserver.clients.forEach(client => {
              if (client.id === room[0][i]) {
                client.send(JSON.stringify({
                  playerNum: room[0].length,
                  order: i
                }));
              }
            });
          }
        }
      } else if ("priv-" + obj.joinRoom in gameRooms) {
        // Adds the player to the specified room if its private
        privacy = "priv-";
        var room = gameRooms[privacy + obj.joinRoom];
        if (room[0].length < room[2] && !room[3]) {
          gameRooms[privacy + obj.joinRoom][0].push(ws.id)
          ws.send(JSON.stringify({
            joinRoom: privacy + obj.joinRoom,
            owner: false
          }));

          // Updates the player count of all players in the room
          for (var i = 0; i < room[0].length; i++) {
            sockserver.clients.forEach(client => {
              if (client.id === room[0][i]) {
                client.send(JSON.stringify({
                  playerNum: room[0].length,
                  order: i
                }));
              }
            });
          }
        }
      } else {
        // Returns and error if no rooms were found
        ws.send(JSON.stringify({
          joinRoom: "error"
        }));
        return;
      }
    } else if ("updateRoom" in obj) {
      // Updates the privacy of a game room
      if (obj.updateRoom in gameRooms) {
        // Finds the room and creates an edited ID
        var newID = obj.new + obj.updateRoom.substring(obj.updateRoom.indexOf("-") + 1);

        // Creates a new room with all the same data but with new ID
        gameRooms[newID] = [gameRooms[obj.updateRoom][0], gameRooms[obj.updateRoom][1], gameRooms[obj.updateRoom][2]];
        // Removes old room
        delete gameRooms[obj.updateRoom];

        // Updates all clients in the room of the change in privacy
        for (var i = 0; i < gameRooms[newID][0].length; i++) {
          sockserver.clients.forEach(client => {
            if (client.id === gameRooms[newID][0][i]) {
              client.send(JSON.stringify({
                joinRoom: newID
              }));
            }
          });
        }
      }
    } else if ("startRoom" in obj) {
      // Runs when the owner starts the game room to tell all other clients the game has started
      sockserver.clients.forEach(client => {
        for (var i = 0; i < gameRooms[obj.roomID][0].length; i++) {
          if (client.id === gameRooms[obj.roomID][0][i]) {
            client.send(JSON.stringify({
              startRoom: obj.roomID
            }));
          }
        }
      });
      gameRooms[obj.roomID][3] = true;
    } else if ("gameMove" in obj) {
      // Distributes game moves between players
      console.log(obj.gameMove + " " + obj.roomID);
      for (var i = 0; i < gameRooms[obj.roomID][0].length; i++) {
        sockserver.clients.forEach(client => {
          if (client.id === gameRooms[obj.roomID][0][i]) {
            client.send(JSON.stringify({
              gameMove: obj.gameMove,
              id: obj.id
            }));
          }
        });
      }
    } else if ("rematch" in obj) {
      // Sends a notification between players when they are requesting a rematch
      for (var i = 0; i < gameRooms[obj.roomID][0].length; i++) {
        sockserver.clients.forEach(client => {
          if (client.id === gameRooms[obj.roomID][0][i]) {
            client.send(JSON.stringify({
              rematch: obj.rematch
            }));
          }
        });
      }
    } else if ("id" in obj) {
      // When a client selects a username
      var validName = true;

      // Checks if the username is taken and if so tells the client to select a different username
      for (const [key, value] of Object.entries(clients)) {
        
        if (obj.id == value[0]) {
          console.log("Duplicate username detected");
          validName = false;
          ws.send(JSON.stringify({
            invalidName: true,
            usernameError: "Username Taken"
          }));
          break;
        }
      }

      // Checks if the username is explicit and if so tells the client to select a different username
      const matcher = new RegExpMatcher({
        ...englishDataset.build(),
        ...englishRecommendedTransformers,
      });
      if(matcher.hasMatch(obj.id)){
        console.log("Profane username detected"); 
        validName = false;
        ws.send(JSON.stringify({
          invalidName: true,
          usernameError: "Invalid Username",
          
        }));
      }

      if (validName) {
        // If the username is valid, the client is assigned a uid
        var haveId = true
        while (haveId) {
          ws.id = sockserver.getUniqueID();
          haveId = clients.hasOwnProperty(ws.id)
        }
        console.log(`username: ${obj.id} uid: ${ws.id}`);
        clients[ws.id] = [obj.id, 0.0, 0.0];
        // The client is then sent a comfimation message
        ws.send(JSON.stringify({
          invalidName: false,
          usr: obj.id
        }));
        // A join message is distributed to the rest of the users
        sockserver.clients.forEach(client => {
          client.send(JSON.stringify({
            id: obj.id,
            joinMsg: `${obj.id} has connected!`
          }));
        });
      }
    }
  })

  ws.onerror = function () {
    // Handles any errors with the websocket
    console.log('websocket error');
  }
});

function distance(x1, x2, y1, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

const server = http.createServer(app);

server.on('upgrade', (request, socket, head) => {
  sockserver.handleUpgrade(request, socket, head, (ws) => {
    sockserver.emit('connection', ws, request);
  });
});

server.listen(port, () => console.log(`Listening on http://localhost:${port}`));


function removeFromArray(arr, i) {
  var halfBeforeTheUnwantedElement = arr.slice(0, i);
  var halfAfterTheUnwantedElement = arr.splice(i + 1);
  return halfBeforeTheUnwantedElement.concat(halfAfterTheUnwantedElement);
}