window.Connection = (function() {
  'use strict';

  const WS_PORT = 8022;
  const WS_HOST = 'ws://' + window.location.hostname + ':' + WS_PORT;

  function Connection(id) {
    this.id = id;
    this.socket = null;
    this.initialized = false;
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
      case 'error':
        type = parts[1];
        sender = parts[2];
        payload = parts[3];
        this.handlers[type] && this.handlers[type].forEach(handler => {
          handler(`could not complete ${payload}`, sender, payload);
        });
        break;

      default:
        this.handlers[type] && this.handlers[type].forEach(handler => {
          handler(null, sender, payload);
        });
        break;
    }
  };

  Connection.prototype.send = function(type, recipient, payload, cb) {
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

  Connection.prototype.registerHandler = function(type, cb) {
    if (!this.handlers[type]) {
      this.handlers[type] = [];
    }
    this.handlers[type].push(cb);
  };

  Connection.prototype.sendRegister = function(cb) {
    this.registerHandler('register_ack', cb);
    this.send('register', null, null);
  };

  Connection.prototype.init = function(cb) {
    if (this.initialized) {
      return cb && cb(null);
    }

    this.sendRegister(err => {
      if (!err) {
        this.initialized = true
      }
      cb && cb(err);
    });
  };

  return Connection;
})();
