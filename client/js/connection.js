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
    this.handlers = {};
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
      case 'connect':
        this.onconnect && this.onconnect(sender);
        this.sendConnectAck(sender);
        break;

      case 'connect_ack':
        var handler = this._getHandler('connect', sender);
        if (!handler) {
          console.log('unable to find connect handler', sender);
        } else {
          handler();
        }
        break;

      case 'ping':
        this.sendPingAck(sender, payload);
        break;

      case 'ping_ack':
        var handler = this._getHandler('ping', payload);
        if (!handler) {
          console.log('unable to find pingId handler', payload);
        } else {
          handler();
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

  Connection.prototype._registerHandler = function(type, id, cb) {
    if (!this.handlers[type]) {
      this.handlers[type] = {};
    }
    this.handlers[type][id] = cb;
  };

  Connection.prototype._getHandler = function(type, id) {
    if (!this.handlers[type]) {
      return null;
    }
    return this.handlers[type][id];
  };

  Connection.prototype.sendRegister = function(cb) {
    this._send('register', null, null, cb);
  };

  Connection.prototype.sendPing = function(peerId, cb) {
    var pingId = Utility.guid();
    this._registerHandler('ping', pingId, cb);
    this._send('ping', peerId, pingId);
  };

  Connection.prototype.sendPingAck = function(recipient, pingId, cb) {
    this._send('ping_ack', recipient, pingId, cb);
  };

  Connection.prototype.sendConnect = function(peerId, cb) {
    this._registerHandler('connect', peerId, cb);
    this._send('connect', peerId, null);
  };

  Connection.prototype.sendConnectAck = function(recipient, cb) {
    this._send('connect_ack', recipient, null, cb);
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
