var http = require('http');
var fs = require('fs');
var os = require('os');
var path = require('path');
var ws = require('ws');

const PORT = 8021;
const WS_PORT = 8022;
const BASE_URL = `http:\/\/${os.hostname()}:${PORT}\/`;
const BASE_PATH = path.resolve(__dirname, '..');
const SITE_PATH = path.resolve(BASE_PATH, 'client');

function serveFile(p, res) {
  var filePath = path.resolve(SITE_PATH, './' + p);
  fileStream = fs.createReadStream(filePath);
  fileStream.on('error', err => {
    if (err.code === 'ENOENT') {
      res.writeHead(404);
      res.end(`404: File not found, ${p}`);
    } else {
      res.writeHead(500);
      res.end(`500: Unknown Server Error`);
    }
  });
  res.writeHead(200);
  fileStream.pipe(res);
}

function getPath(req) {
  var url = req.url.split('?')[0];
  if (url.endsWith('/')) {
    url += 'index.html';
  }
  return url;
}

var app = http.createServer((req, res) => {
  serveFile(getPath(req), res);
});

app.listen(PORT);
console.log(`Listening on ${BASE_URL}`);

// WebSockets
var clients = {};
websockets = new ws.Server({ server: app, port: WS_PORT });
websockets.on('connection', socket => {
  socket.on('message', message => {
    var parts = message.split(' ');
    var type = parts[0];
    var sender = parts[1];
    var recipient = parts[2];
    var payload = parts[3];

    // Register is the only message handled by the server.
    if (type === 'register') {
      clients[sender] = socket;
      socket.clientId = sender;
      socket.send('register_ack');
      return;
    }

    // Pass message on to recipient, whatever it may mean.
    if (!clients[recipient]) {
      socket.send(`error ${type} ${sender} ${payload}`);
      return;
    }

    clients[recipient].send(`${type} ${sender} ${payload}`);
  });

  socket.on('close', () => {
    delete clients[socket.clientId];
  });
});
