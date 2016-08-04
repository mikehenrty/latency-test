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
    listen: function(clientId) {
      ensureConnection(clientId, err => {
        if (!err) {
          console.log('SUCCESS!!');
        }
      });
    },

    connect: function(clientId, peerId, cb) {
      ensureConnection(clientId, err => {
        if (!err) {
          // TODO: add code here to connect to ping other socket.
        }
        cb && cb(err);
      });
    }
  };
})();
