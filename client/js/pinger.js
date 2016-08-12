window.Pinger = (function() {

  function Pinger(clientId, connection) {
    this.clientId = clientId;
    this.connection = connection;
    this.pingHandlers = {};
    this.connection.registerHandler('ping', this.handlePing.bind(this));
    this.connection.registerHandler('ping_ack', this.handlePingBack.bind(this));
    this.connection.registerHandler('request', this.handleRequest.bind(this));
    this.connection.registerHandler('results', this.handleResults.bind(this));
    this.onresults = null;
  }

  Pinger.prototype.handlePing = function(err, peerId, pingId) {
    if (err) {
      // If we got an error when sending ping, immediately call cb.
      return this.callPingHandler(err, pingId);
    } else {
      this.connection.send('ping_ack', peerId, pingId);
    }
  };

  Pinger.prototype.handlePingBack = function(err, peerId, pingId) {
    this.callPingHandler(err, pingId);
  };

  Pinger.prototype.addPingHandler = function(pingId, startTime, cb) {
    this.pingHandlers[pingId] = {
      startTime: startTime,
      cb: cb
    };
  };

  Pinger.prototype.handleRequest = function(err, peerId, count) {
    this.pingSerial(peerId, count);
  };

  Pinger.prototype.handleResults = function(err, peerId, payload) {
    var results = payload.split(',').map(number => {
      return parseInt(number, 10);
    });
    this.onresults && this.onresults(peerId, this.clientId, results);
  };

  Pinger.prototype.sendRequestForPing = function(peerId, count, cb) {
    this.connection.send('request', peerId, count, cb);
  };

  Pinger.prototype.pingSerial = function(peerId, count, cb) {
    var results = [];
    (function pingNext(curPing) {
      if (curPing < count) {
        this.ping(peerId, (err, result) => {
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

  Pinger.prototype.callPingHandler = function(err, pingId) {
    var handler = this.pingHandlers[pingId];
    delete this.pingHandlers[pingId];
    var cb = handler && handler.cb;
    cb && cb(err, Date.now() - handler.startTime);
  };

  Pinger.prototype.ping = function(peerId, cb) {
    var pingId = Utility.guid();
    this.addPingHandler(pingId, Date.now(), cb);
    this.connection.send('ping', peerId, pingId);
  };

  Pinger.prototype.onPingResults = function(cb) {
    this.onresults = cb;
  };

  return Pinger;
})();
