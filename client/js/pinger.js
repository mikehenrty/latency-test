window.Pinger = (function() {

  const INDIRECT = 'websocket';
  const DIRECT = 'webrtc';

  function Pinger(clientId, connection) {
    this.clientId = clientId;
    this.connection = connection;
    this.p2p = new P2P(clientId, connection);
    this.pingHandlers = {};
    this.addMessageHandler('ping', this.handlePing);
    this.addMessageHandler('ping_ack', this.handlePingBack);
    this.addMessageHandler('request', this.handleRequest);
    this.addMessageHandler('results', this.handleResults);
    this.onresults = null;
  }

  Pinger.prototype._ensureP2PConnection = function(peerId, cb) {
    if (this.p2p.peerId === peerId && this.p2p.isConnected()) {
      return cb && cb(null);
    }
    this.p2p.connect(peerId, cb);
  };

  Pinger.prototype.getConnectionType = function(type) {
    return type === INDIRECT ? this.connection : this.p2p;
  };

  Pinger.prototype.addMessageHandler = function(type, handler) {
    this.connection.registerHandler(type, handler.bind(this, INDIRECT));
    this.p2p.registerHandler(type, handler.bind(this, DIRECT));
  };

  Pinger.prototype.handlePing = function(type, err, peerId, pingId) {
    if (err) {
      // If we got an error when sending ping, immediately call cb.
      return this.callPingHandler(err, pingId);
    }

    var conn = this.getConnectionType(type);
    conn.send('ping_ack', peerId, pingId);
  };

  Pinger.prototype.handlePingBack = function(type, err, peerId, pingId) {
    this.callPingHandler(err, pingId);
  };

  Pinger.prototype.addPingHandler = function(pingId, startTime, cb) {
    this.pingHandlers[pingId] = {
      startTime: startTime,
      cb: cb
    };
  };

  Pinger.prototype.handleRequest = function(type, err, peerId, count) {
    this._pingSerial(type, peerId, count);
  };

  Pinger.prototype.handleResults = function(type, err, peerId, payload) {
    var results = payload.split(',').map(number => {
      return parseFloat(number);
    });
    this.onresults && this.onresults(peerId, this.clientId, results);
  };

  Pinger.prototype._sendRequestForPing = function(type, peerId, count, cb) {
    this.getConnectionType(type).send('request', peerId, count, cb);
  };

  Pinger.prototype.sendRequestForPingDirect = function(peerId, count, cb) {
    this._ensureP2PConnection(peerId, err => {
      if (err) {
        return cb && cb(err);
      }
      this._sendRequestForPing(DIRECT, peerId, count, cb);
    });
  };

  Pinger.prototype.sendRequestForPing = function(peerId, count, cb) {
    this._sendRequestForPing(INDIRECT, peerId, count, cb);
  };

  Pinger.prototype._pingSerial = function(type, peerId, count, cb) {
    var results = [];
    (function pingNext(curPing) {
      if (curPing < count) {
        this._ping(type, peerId, (err, result) => {
          if (err) {
            console.log('ping error', err);
            return cb && cb(err);
          }
          results.push(result);
          pingNext.call(this, ++curPing);
        });
      } else {
        this.onresults && this.onresults(this.clientId, peerId, results);
        this.connection.send('results', peerId, results);
        cb && cb(null, results);
      }
    }.bind(this))(0);
  };

  Pinger.prototype.pingSerialDirect = function(peerId, count, cb) {
    this._ensureP2PConnection(peerId, err => {
      if (err) {
        return cb && cb(`unable to connect to ${peerId}, ${err}`);
      }
      this._pingSerial(DIRECT, peerId, count, cb);
    });
  };

  Pinger.prototype.pingSerial = function(peerId, count, cb) {
    this._pingSerial(INDIRECT, peerId, count, cb);
  };

  Pinger.prototype.callPingHandler = function(err, pingId) {
    var handler = this.pingHandlers[pingId];
    delete this.pingHandlers[pingId];
    var cb = handler && handler.cb;
    cb && cb(err, performance.now() - handler.startTime);
  };

  Pinger.prototype._ping = function(type, peerId, cb) {
    var pingId = Utility.guid();
    this.addPingHandler(pingId, performance.now(), (err, result) => {
      // Round any performance numbers to 3 decimal places.
      result = result && Utility.roundDecimals(result, 3);
      cb && cb(err, result);
    });
    this.getConnectionType(type).send('ping', peerId, pingId);
  };

  Pinger.prototype.ping = function(peerId, cb) {
    this._ping(INDIRECT, peerId, cb);
  };

  Pinger.prototype.pingDirect = function(peerId, cb) {
    this._ensureP2PConnection(peerId, err => {
      if (err) {
        return cb && cb(`unable to connect to peer ${peerId}`);
      }
      this._ping(DIRECT, peerId, cb);
    });
  }

  Pinger.prototype.onPingResults = function(cb) {
    this.onresults = cb;
  };

  return Pinger;
})();
