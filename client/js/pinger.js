window.Pinger = (function() {

  function Pinger(connection) {
    this.connection = connection;
    this.pingHandlers = {};
    this.connection.registerHandler('ping', this.handlePing.bind(this));
    this.connection.registerHandler('ping_ack', this.handlePingBack.bind(this));
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

  return Pinger;
})();
