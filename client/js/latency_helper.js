window.LatencyHelper = (function() {
  'use strict';

  function LatencyHelper(clientId) {
    this.clientId = clientId;
    this.connection = null;
    this.connectionHandler = null;
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

  LatencyHelper.prototype.pingOnce = function(peerId, cb) {
    this._ensureConnection(err => {
      if (err) {
        return cb && cb(err);
      }
      var before = Date.now();
      this.connection.sendPing(peerId, err => {
        cb && cb(err, Date.now() - before);
      });
    });
  };

  LatencyHelper.prototype.pingSerial = function(peerId, count, cb) {
    var results = [];
    var pingNext = (curPing) => {
      if (curPing < count) {
        this.pingOnce(peerId, (err, result) => {
          if (err) {
            console.log('ping error', err);
          }
          results.push(result);
          pingNext(++curPing);
        })
      } else {
        this.resultsHandler &&
          this.resultsHandler(this.clientId, peerId, results);
        this.connection.sendResults(peerId, results);
        cb && cb(null, results);
      }
    };
    pingNext(0);
  };

  LatencyHelper.prototype.onResults = function(cb) {
    this.resultsHandler = cb;
  };

  LatencyHelper.prototype.onConnection = function(cb) {
    this.connectionHandler = cb;
  };

  LatencyHelper.prototype.connect = function(peerId, cb) {
    this._ensureConnection(() => {
      this.connection.sendConnect(peerId, cb);
    });
  };

  LatencyHelper.prototype.init = function(cb) {
    this._ensureConnection(err => {

      this.connection.onPeerConnect(peerId => {
        this.connectionHandler && this.connectionHandler(peerId);
      });

      this.connection.onPeerResults((peerId, results) => {
        this.resultsHandler &&
          this.resultsHandler(peerId, this.clientId, results);
      });

      this.connection.onPeerRequest((peerId, count) => {
        this.pingSerial(peerId, count);
      });

      cb && cb(err);
    });
  };

  LatencyHelper.prototype.pingTest = function(peerId, count, cb) {
    // TODO: add more types of ping tests
    this.pingSerial(peerId, count, (err, results) => {
      if (err) {
        return cb && cb(err);
      }

      this.connection.sendRequestForPing(peerId, count, cb);
    });
  };

  return LatencyHelper;
})();
