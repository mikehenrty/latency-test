window.LatencyHelper = (function() {
  'use strict';

  function LatencyHelper(clientId) {
    this.clientId = clientId;
    this.connection = null;
    this.resultsHandler = null;
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
      this.pinger.onPingResults((fromId, toId, type, results) => {
        this.resultsHandler &&
          this.resultsHandler(fromId, toId, type, results);
      });
      cb && cb(null);
    });
  };

  LatencyHelper.prototype.onResults = function(cb) {
    this.resultsHandler = cb;
  };

  LatencyHelper.prototype.pingTest = function(peerId, count, cb) {
    (new Utility.Queue()).add((cb) => {
      this._ensurePinger(cb);
    }, (cb) => {
      this.pinger.pingSerialDirect(peerId, count, cb);
    }, (cb) => {
      this.pinger.pingSerial(peerId, count, cb);
    }, () => {
      this.pinger.sendRequestForPingDirect(peerId, count);
      this.pinger.sendRequestForPing(peerId, count);
      cb && cb(null);
    }).catch(err => {
      cb && cb(err);
    });
  };

  LatencyHelper.prototype.listen = function(cb) {
    this._ensurePinger(cb);
  };

  return LatencyHelper;
})();
