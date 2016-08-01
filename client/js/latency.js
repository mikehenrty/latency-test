window.Latency = (function() {
  'use strict';

  var connection;

  return {
    listen: function(clientId) {
      connection = connection || new Connection(clientId);
      connection.init(err => {
        if (!err) {
          console.log('SUCCESS!!');
        }
      });
    },

    connect: function(clientId, peerId) {
      connection = connection || new Connection(clientId);
    }
  };
})();
