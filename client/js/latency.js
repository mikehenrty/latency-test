window.Latency = (function() {
  'use strict';

  var connection;

  function ensureConnection(clientId, cb) {
    if (connection && connection.initialized) {
      cb && cb(null);
    }

    if (!connection) {
      connection = new Connection(clientId);
    }

    if (!connection.initialized) {
      connection.init(cb);
    }
  }

  return {
    listen: function(clientId, cb) {
      ensureConnection(clientId, err => {
        cb && cb(err);
      });
    },

    connect: function(clientId, peerId, cb) {
      ensureConnection(clientId, err => {
        if (err) {
          cb && cb(err);
        }
        Latency.ping(clientId, peerId, (err, result) => {
          if (!err) {
            DOM.p('ping result ' + result + 'ms');
          }
        });
      });
    },

    ping: function(clientId, peerId, cb) {
      ensureConnection(clientId, err => {
        if (err) {
          return cb && cb(err);
        }
        var before = Date.now();
        connection.sendPing(peerId, err => {
          cb && cb(err, Date.now() - before);
        });
      });
    }
  };
})();
