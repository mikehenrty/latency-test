window.LatencyHelper = (function() {
  'use strict';

  function LatencyHelper(clientId) {
    this.clientId = clientId;
    this.connection = null;
    this.resultHandler = null;
  }

  LatencyHelper.prototype._ensureConnection = function(cb) {
    if (this.connection && this.connection.initialized) {
      cb && cb(null);
    }

    if (!this.connection) {
      this.connection = new Connection(this.clientId);
    }

    if (!this.connection.initialized) {
      this.connection.init(cb);
    }
  };

  LatencyHelper.prototype._ensurePinger = function(cb) {
    if (this.pinger) {
      return cb && cb(null);
    }
    this._ensureConnection(() => {
      this.pinger = new Pinger(this.clientId, this.connection);
      this.pinger.onPingResults((fromId, toId, results) => {
        this.resultsHandler &&
          this.resultsHandler(fromId, toId, results);
      });
      cb && cb(null);
    });
  };

  LatencyHelper.prototype.onResults = function(cb) {
    this.resultsHandler = cb;
  };

  LatencyHelper.prototype.pingTest = function(peerId, count, cb) {
    // TODO: add more types of ping tests
    this._ensurePinger(() => {
      this.pinger.pingSerialDirect(peerId, count, (err, results) => {
        if (err) {
          return cb && cb(err);
        }
        this.pinger.sendRequestForPingDirect(peerId, count, cb);
      });
    });
  };

  LatencyHelper.prototype.listen = function(cb) {
    this._ensurePinger(cb);
  };

  return LatencyHelper;
})();
