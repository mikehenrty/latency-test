var http = require('http');
var fs = require('fs');
var os = require('os');
var path = require('path');
var ws = require('ws');
var Utility = require('./lib/utility.js');
var console = require('./lib/console_debug.js');
console.DEBUG = false; // set to true for debug logging.

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

var app = http.createServer((req, res) => {
  serveFile(Utility.getPathFromUrl(req.url), res);
});

app.listen(PORT);
console.log(`Listening on ${BASE_URL}`);

// WebSockets
var clients = {};
websockets = new ws.Server({ server: app, port: WS_PORT });
websockets.on('connection', socket => {
  socket.on('message', message => {
    var parts = message.split(' ');
    var type = parts.shift();
    var sender = parts.shift();
    var recipient = parts.shift();
    var payload = parts.join(' ');

    // use setTimeout so that client list gets updated before printing.
    console.DEBUG && setTimeout(() => {
      console.debug(type, Utility.guidToNiceName(sender),
                Utility.guidToNiceName(recipient), payload,
                '\n', Utility.guidToNiceName(Object.keys(clients)), '\n');
    }, 0);

    // Register is the only message handled by the server.
    if (type === 'register') {
      clients[sender] = socket;
      socket.clientId = sender;
      socket.send('register_ack');
      return;
    }

    // Pass message on to recipient, whatever it may mean.
    if (!clients[recipient]) {
      console.log(`unrecognized ${recipient} ${Object.keys(clients)}\n`);
      socket.send(`error ${type} ${recipient} ${payload}`);
      return;
    }

    clients[recipient].send(`${type} ${sender} ${payload}`);
  });

  socket.on('close', () => {
    delete clients[socket.clientId];
  });
});
