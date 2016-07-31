var http = require('http');
var fs = require('fs');
var os = require('os');
var path = require('path');

const PORT = 8021;
const BASE_URL = `http:\/\/${os.hostname()}:${PORT}\/`;
const BASE_PATH = path.resolve(__dirname, '..');
const SITE_PATH = path.resolve(BASE_PATH, 'client');

function serveFile(filePath, res) {
  filePath = path.resolve(SITE_PATH, './' + filePath);
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end(`404: File not found, ${filePath}`);
    } else {
      res.writeHead(200);
      res.end(content, 'utf-8');
    }
  });
}

var app = http.createServer((req, res) => {
  console.log('Request received', req.url);

  switch(req.url) {
    case '/':
      serveFile('index.html', res);
      break;

    default:
      serveFile(req.url, res);
      break;
  }
});

app.listen(PORT);
console.log(`Listening on ${BASE_URL}`);
