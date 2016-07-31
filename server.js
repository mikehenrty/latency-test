var http = require('http');
var fs = require('fs');
var os = require('os');

const PORT = 8021;
const BASE_URL = `http:\/\/${os.hostname()}:${PORT}\/`;

function serveFile(path, res) {
  fs.readFile(path, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end(`500: Could not read file ${path}, ${err}`);
    } else {
      res.writeHead(200);
      res.end(content, 'utf-8');
    }
  });
}

var app = http.createServer((req, res) => {
  console.log(req.url);
  switch(req.url) {
    case '/':
      serveFile('./index.html', res);
      break;

    default:
      res.writeHead(404);
      res.end('404: File not found');
      break;
  }
});

app.listen(PORT);
console.log(`Listening on ${BASE_URL}`);
