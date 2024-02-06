var http = require('http');
var fs = require('fs');

console.log('test');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  var myReadStream = fs.createReadStream(__dirname + '/index.html', 'utf8');
  myReadStream.pipe(res);
  console.log("succesful");
}).listen(8080);