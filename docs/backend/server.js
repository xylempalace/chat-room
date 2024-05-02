
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
  '/games.js' : ['text/javascript', '../frontend/games.js'],
  '/imageManipulator.js' : ['text/javascript', '../tools/imageTools/imageManipulator.js'],

  // Tiles
  '/sprites/tiles/floor.png' : ['image/png', '../frontend/sprites/tiles/floor.png'],
  '/sprites/tiles/wall.png' : ['image/png', '../frontend/sprites/tiles/wall.png'],
  '/sprites/tiles/grass.png' : ['image/png', '../frontend/sprites/tiles/grass.png'],
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
  '/sprites/speechBubble.png' : ['image/png', '../frontend/sprites/speechBubble.png'],
  '/sprites/bg.png' : ['image/png', '../frontend/sprites/bg.png'],

  // Props
  '/sprites/tree.png' : ['image/png', '../frontend/sprites/tree.png'],
  '/sprites/tree2.png' : ['image/png', '../frontend/sprites/tree2.png'],
  '/sprites/pillar_1.png' : ['image/png', '../frontend/sprites/pillar_1.png'],
  '/sprites/pillar_2.png' : ['image/png', '../frontend/sprites/pillar_2.png'],
  '/sprites/pillar_3.png' : ['image/png', '../frontend/sprites/pillar_3.png'],
  '/sprites/pillar_4.png' : ['image/png', '../frontend/sprites/pillar_4.png'],

  //Player
  '/sprites/player/base.png' : ['image/png', '../frontend/sprites/player/base.png'],
  '/sprites/player/base_flipped.png' : ['image/png', '../frontend/sprites/player/base_flipped.png'],
  '/sprites/player/flower.png' : ['image/png', '../frontend/sprites/player/flower.png'],
  '/sprites/player/flower_flipped.png' : ['image/png', '../frontend/sprites/player/flower_flipped.png'],
};

var clients = {};

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
      console.log(`${clients[ws.id][0]}(${ws.id}) has disconnected!`);
      sockserver.clients.forEach(client => {
        client.send(JSON.stringify({
          id: clients[ws.id][0],
          expired: true
        })); 
      });
      delete clients[ws.id];
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
      clients[ws.id][1] = obj.posX;
      clients[ws.id][2] = obj.posY;
      sockserver.clients.forEach(client => {
        client.send(JSON.stringify({
          id: obj.id,
          posX: obj.posX,
          posY: obj.posY
        }));
      });
    } else if ("msg" in obj) {
      // When a message is sent this code distributes that message to other clients
      sockserver.clients.forEach(client => {
        if (distance(clients[client.id][1], clients[ws.id][1], clients[client.id][2], clients[ws.id][2]) < 800) {
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
    } else if ("id" in obj) {
      // When a client selects a username
      var validName = true;

      // Checks if the username is taken and if so tells the client to select a different username
      console.log(clients);
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
