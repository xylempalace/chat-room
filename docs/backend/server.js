
//Script used to send index.html in response to HTTP request

//Import express library and declare it as var app
const express = require('express')
const app = express()

const port = 3000
//Import path library
const path = require('path')

//Sends index.html and coressponding css file, TODO: Send JS file as well.
app.get('/', (req, res) => {
  app.use(express.static("frontend"));
  res.set('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
})

app.get('/web.css', (req, res) => {
  app.use(express.static("frontend"));
  res.set('Content-Type', 'text/css');
  res.sendFile(path.join(__dirname, '../frontend/web.css'));
})

app.get('/test.js', (req, res) => {
  app.use(express.static("frontend"));
  res.set('Content-Type', 'text/javascript');
  res.sendFile(path.join(__dirname, '../frontend/test.js'));
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})