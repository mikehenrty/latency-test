window.Pinger = (function() {

  function Pinger(connection) {
    this.connection = connection;
    this.pingHandlers = {};
    this.connection.registerHandler('ping', this.handlePing.bind(this));
    this.connection.registerHandler('ping_ack', this.handlePingBack.bind(this));
  }

  Pinger.prototype.handlePing = function(err, peerId, pingId) {
    // If we got an error when sending ping, immediately call cb.
    if (err) {
      var handler = this.pingHandlers[pingId];
      var cb = handler && handler.cb;
      return cb && cb(err);
    }

    this.connection.send('ping_ack', peerId, pingId);
  };

  Pinger.prototype.handlePingBack = function(err, peerId, pingId) {
    var handler = this.pingHandlers[pingId];
    var cb = handler && handler.cb;
    cb && cb(err, Date.now() - handler.startTime);
  };

  Pinger.prototype.addPingHandler = function(pingId, startTime, cb) {
    this.pingHandlers[pingId] = {
      startTime: startTime,
      cb: cb
    };
  };

  Pinger.prototype.ping = function(peerId, cb) {
    var pingId = Utility.guid();
    this.addPingHandler(pingId, Date.now(), cb);
    this.connection.send('ping', peerId, pingId);
  };

  return Pinger;
})();
