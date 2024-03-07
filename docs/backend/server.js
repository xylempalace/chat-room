
//Script used to send index.html in response to HTTP request

//Import express library and declare it as var app
const express = require('express')
const app = express()
const { WebSocketServer } = require('ws')
const sockserver = new WebSocketServer({ port: 443 })

sockserver.getUniqueID = function () {
  function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4();
};

const port = 3000
//Import path library
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

const files = {
  '/' : ['text/html', '../frontend/index.html'],
  '/web.css' : ['text/css', '../frontend/web.css'],
  '/test.js' : ['text/javascript', '../frontend/test.js'],
  '/favicon.ico' : ['image/vnd.microsoft.icon', '../images/favicon.ico'],
  '/lemEngine.js' : ['text/javascript', '../frontend/lemEngine.js'],
  '/sprites/tiles/floor.png' : ['image/png', '../frontend/sprites/tiles/floor.png'],
  '/sprites/tiles/wall.png' : ['image/png', '../frontend/sprites/tiles/wall.png'],
  '/sprites/tiles/grass.png' : ['image/png', '../frontend/sprites/tiles/grass.png'],
  '/sprites/tiles/pathCenter.png' : ['image/png', '../frontend/sprites/tiles/pathCenter.png'],
  '/sprites/tiles/pathNorth.png' : ['image/png', '../frontend/sprites/tiles/pathNorth.png'],
  '/sprites/tiles/pathSouth.png' : ['image/png', '../frontend/sprites/tiles/pathSouth.png'],
  '/sprites/speechBubble.png' : ['image/png', '../frontend/sprites/speechBubble.png'],
};

var clients = {};

//Sends index.html and coressponding css file, TODO: Send JS file as well.
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

sockserver.on('connection', ws => {
  console.log('New client connected!'); 

  ws.on('close', () => {
    console.log(`${clients[ws.id]}(${ws.id}) has disconnected!`);
    sockserver.clients.forEach(client => {
      client.send(JSON.stringify({
        id: clients[ws.id],
        expired: true
      })); 
    });
    delete clients[ws.id];
  });

  ws.on('message', (str) => {
    var obj = JSON.parse(str);
  
    if ("posX" in obj) {
      sockserver.clients.forEach(client => {
        client.send(JSON.stringify({
          id: obj.id,
          posX: obj.posX,
          posY: obj.posY
        }));
      });
    } else if ("msg" in obj) {
      sockserver.clients.forEach(client => {
        const matches = matcher.getAllMatches(obj.msg);
        var newmsg = (censor.applyTo(obj.msg, matches));
        obj.msg = newmsg; 
        console.log(`distributing message: ${obj.msg}`);
        client.send(JSON.stringify({
          id: obj.id,
          msg: obj.msg
        }));
      });
    } else if ("id" in obj) {
      var validName = true;



      for (const [key, value] of Object.entries(clients)) {
        if (obj.id == value) {
          validName = false;
          ws.send(JSON.stringify({
            invalidName: true
          }));
          break;
        }
      }
      const matcher = new RegExpMatcher({
        ...englishDataset.build(),
        ...englishRecommendedTransformers,
      });
      if(matcher.hasMatch(obj.id)){
        console.log("Profane username detected"); 
        validName = false;
        ws.send(JSON.stringify({
          invalidName: true
        }));
      }
        


      if (validName) {
        var haveId = true
        while (haveId) {
          ws.id = sockserver.getUniqueID();
          haveId = clients.hasOwnProperty(ws.id)
        }
        console.log(`username: ${obj.id} uid: ${ws.id}`);
        clients[ws.id] = obj.id;
        ws.send(JSON.stringify({
          invalidName: false,
          usr: obj.id
        }));
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
    console.log('websocket error');
  }
})