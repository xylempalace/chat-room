
//Script used to send index.html in response to HTTP request

//Import express library and declare it as var app
const express = require('express')
const app = express()
const { WebSocketServer } = require('ws')
const sockserver = new WebSocketServer({ port: 443 })

const port = 3000
//Import path library
const path = require('path')
const { Socket } = require('dgram')

//Sends index.html and coressponding css file, TODO: Send JS file as well.
app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
})

app.get('/web.css', (req, res) => {
  res.set('Content-Type', 'text/css');
  res.sendFile(path.join(__dirname, '../frontend/web.css'));
})

app.get('/test.js', (req, res) => {
 res.set('Content-Type', 'text/javascript');
  res.sendFile(path.join(__dirname, '../frontend/test.js'));
})

app.get('/favicon.ico', (req, res) => {
  res.set('Content-Type', '	image/vnd.microsoft.icon');
  res.sendFile(path.join(__dirname, '../images/favicon.ico'));
})

app.get('/lemEngine.js', (req, res) => {
  res.set('Content-Type', 'text/javascript');
   res.sendFile(path.join(__dirname, '../frontend/lemEngine.js'));
 })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})

sockserver.on('connection', ws => {
  console.log('New client connected!');
  ws.send('connection established');
  ws.on('close', () => console.log('Client has disconnected!'));
  ws.on('message', data => {
    sockserver.clients.forEach(client => {
      console.log(`distributing message: ${data}`);
      client.send(`${data}`);
    })
  })
  ws.onerror = function () {
    console.log('websocket error');
  }
})