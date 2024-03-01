
//Script used to send index.html in response to HTTP request

//Import express library and declare it as var app
const express = require('express')
const app = express()
const { WebSocketServer } = require('ws')
const sockserver = new WebSocketServer({ port: 443 })

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

var clients = {};

//Sends index.html and coressponding css file, TODO: Send JS file as well.
app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/.', (req, res) => {
  console.log(req);
});

app.get('/web.css', (req, res) => {
  res.set('Content-Type', 'text/css');
  res.sendFile(path.join(__dirname, '../frontend/web.css'));
});

app.get('/test.js', (req, res) => {
 res.set('Content-Type', 'text/javascript');
  res.sendFile(path.join(__dirname, '../frontend/test.js'));
});

app.get('/favicon.ico', (req, res) => {
  res.set('Content-Type', '	image/vnd.microsoft.icon');
  res.sendFile(path.join(__dirname, '../images/favicon.ico'));
});

app.get('/lemEngine.js', (req, res) => {
  res.set('Content-Type', 'text/javascript');
   res.sendFile(path.join(__dirname, '../frontend/lemEngine.js'));
});

app.get('/sprites/tiles/floor.png', (req, res) => {
  res.set('Content-Type', 'image/png');
   res.sendFile(path.join(__dirname, '../frontend/sprites/tiles/floor.png'));
});

app.get('/sprites/tiles/wall.png', (req, res) => {
  res.set('Content-Type', 'image/png');
   res.sendFile(path.join(__dirname, '../frontend/sprites/tiles/wall.png'));
});

app.get('/sprites/tiles/grass.png', (req, res) => {
  res.set('Content-Type', 'image/png');
   res.sendFile(path.join(__dirname, '../frontend/sprites/tiles/grass.png'));
});

app.get('/sprites/tiles/pathCenter.png', (req, res) => {
  res.set('Content-Type', 'image/png');
   res.sendFile(path.join(__dirname, '../frontend/sprites/tiles/pathCenter.png'));
});

app.get('/sprites/tiles/pathNorth.png', (req, res) => {
  res.set('Content-Type', 'image/png');
   res.sendFile(path.join(__dirname, '../frontend/sprites/tiles/pathNorth.png'));
});

app.get('/sprites/tiles/pathSouth.png', (req, res) => {
  res.set('Content-Type', 'image/png');
   res.sendFile(path.join(__dirname, '../frontend/sprites/tiles/pathSouth.png'));
});

app.get('/sprites/speechBubble.png', (req, res) => {
  res.set('Content-Type', 'image/png');
   res.sendFile(path.join(__dirname, '../frontend/sprites/speechBubble.png'));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

sockserver.on('connection', ws => {
  console.log('New client connected!'); 

  ws.on('close', () => {
    console.log('Client has disconnected!');
    sockserver.clients.forEach(client => {
      client.send(JSON.stringify({
        id: clients[ws.client],
        expired: true
      })); 
    });
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
      console.log(ws.client);
      clients[ws.client] = obj.id;
      sockserver.clients.forEach(client => {
        client.send(JSON.stringify({
          id: obj.id,
          joinMsg: `${obj.id} has connected!`
        }));
      });
    }
  })

  ws.onerror = function () {
    console.log('websocket error');
  }
})