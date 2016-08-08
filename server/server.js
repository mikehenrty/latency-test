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
  // TODO: do this more elegantly.
  var url = req.url;
  if (url.indexOf('?') !== -1) {
    url = url.substr(0, url.indexOf('?'));
  }

  switch(url) {
    case '/':
      serveFile('index.html', res);
      break;

    default:
      serveFile(url, res);
      break;
  }
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

    switch (type) {
      case 'register':
        clients[sender] = socket;
        socket.clientId = sender;
        break;

      case 'ping':
      case 'ping_ack':
      case 'connect':
      case 'connect_ack':
      case 'request':
      case 'results':
        if (!clients[recipient]) {
          socket.send(`error ${sender} ${type} ${recipient} ${payload}`);
        } else {
          clients[recipient].send(`${type} ${sender} ${payload}`);
        }
        break;

      default:
        console.log('unrecognized message type', type);
        break;
    }
  });

  socket.on('close', (thing1, thing2, thing3) => {
    delete clients[socket.clientId];
  });
});
