window.Connection = (function() {
  'use strict';

  const WS_PORT = 8022;
  const WS_HOST = 'ws://' + window.location.hostname + ':' + WS_PORT;

  function Connection(id, type) {
    this.id = id;
    this.type = type || 'websocket';
    this.socket = null;
    this.initialized = false;
    this.onconnect = null;
    this.pingHandlers = [];
  }

  Connection.prototype._ensureWebSocket = function(cb) {
    if (this.socket) {
      return cb && cb(null);
    }

    try {
      this.socket = new WebSocket(WS_HOST);
    } catch (e) {
      console.log('socket connection error ', e);
      cb && cb(e);
    }

    this.socket.addEventListener('message', this._onMessage.bind(this));
    this.socket.addEventListener('open', () => {
      cb && cb(null);
    });
  };

  Connection.prototype._onMessage = function(evt) {
    var parts = evt.data.split(' ');
    var type = parts[0];
    var sender = parts[1];
    var payload = parts[2];

    switch (type) {
      case 'ping':
        this.sendPingAck(sender, payload);
        break;

      case 'ping_ack':
        if (!this.pingHandlers[payload]) {
          console.log('unable to find pingId', payload);
        } else {
          this.pingHandlers[payload]();
        }
        break;

      default:
        console.log('unrecognized message type', type);
        break;
    }
  };

  Connection.prototype._send = function(type, recipient, payload, cb) {
    this._ensureWebSocket(err => {
      if (err) {
        return cb && cb(err);
      }

      recipient = recipient || '';
      payload = payload || '';

      try {
        this.socket.send(`${type} ${this.id} ${recipient} ${payload}`);
        cb && cb(null);
      } catch (e) {
        console.log('socket sending error', e);
        cb && cb(e);
      }
    });
  };

  Connection.prototype._registerPingHandler = function(pingId, cb) {
    this.pingHandlers[pingId] = cb;
  };

  Connection.prototype.sendRegister = function(cb) {
    this._send('register', null, null, cb);
  };

  Connection.prototype.sendPingAck = function(recipient, pingId, cb) {
    this._send('ping_ack', recipient, pingId, cb);
  };

  Connection.prototype.sendPing = function(peerId, cb) {
    var pingId = Utility.guid();
    this._registerPingHandler(pingId, cb);
    this._send('ping', peerId, pingId);
  };

  Connection.prototype.onPeerConnect = function(cb) {
    this.onconnect = cb;
  };

  Connection.prototype.init = function(cb) {
    this.sendRegister(err => {
      if (!err) {
        this.initialized = true
      }
      cb && cb(err);
    });
  };

  return Connection;
})();
