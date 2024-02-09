const express = require('express')
const app = express()
const port = 3000
const path = require('path')

app.get('/', (req, res) => {
  app.use('/static', express.static(path.join(__dirname, 'frontend')));
  console.log(path.join(__dirname, 'frontend'));
  res.set('Content-Type', 'text/html');
  res.sendFile(__dirname + '/index.html');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})