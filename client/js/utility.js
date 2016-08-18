window.Utility = (function() {
  'use strict';

  function Queue() {
    this.tasks = [];
    this.running = false;
    this.handleDone = this.handleDone.bind(this);
  }

  Queue.prototype.handleDone = function(err) {
    if (err) {
      console.log('queue callback error', err);
    }

    this.running = false;
    if (this.tasks.length > 0) {
      this.runNextTask();
    }
  };

  Queue.prototype.runNextTask = function() {
    this.running = true;
    var task = this.tasks.shift();
    if (task.length === 1) {
      task(this.handleDone);
    } else {
      task();
      this.handleDone();
    }
  };

  Queue.prototype.add = function() {
    for (var i = 0; i < arguments.length; i++) {
      this.tasks.push(arguments[i]);
    }
    if (!this.running) {
      this.runNextTask();
    }
  };

  var peerCount = 0;
  var peerNames = {};
  function niceId(guid) {
    if (window.clientId && window.clientId === guid) {
      return 'Me';
    }
    if (peerNames[guid]) {
      return peerNames[guid]
    }
    peerNames[guid] = 'peer_' + ++peerCount;
    return peerNames[guid];
  }

  return {
    guid: function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
      });
    },

    sum: function(data) {
      return data.reduce((prev, cur) => prev + cur, 0);
    },

    mean: function(data) {
      if (data.length === 0) {
        return 0;
      }
      return Utility.sum(data) / data.length;
    },

    stddev: function(data) {
      if (data.length === 0) {
        return 0;
      }
      var mean = Utility.mean(data);
      var sumOfDistances = Utility.sum(data.map(result => {
        return Math.pow(mean - result, 2);
      }));
      return Math.sqrt(sumOfDistances / data.length);
    },

    roundDecimals: function(num) {
      return parseFloat(num.toFixed(3));
    },

    once: function(fn) {
      var called = false;
      return function() {
        if (!called) {
          called = true;
          return fn.apply(null, arguments);
        }
      };
    },

    getPeerLink: function() {
      var id = Utility.getClientId();
      var url = new URL(window.location.href);
      return `${url.protocol}\/\/${url.host}${url.pathname}?peer=${id}`;
    },

    getPeerId: function() {
      var url = new URL(window.location.href);
      return url.searchParams.get('peer');
    },

    getClientId: function() {
      if (!window.clientId) {
        window.clientId = Utility.guid();
        console.log('client id', window.clientId);
      }
      return window.clientId;
    },

    niceId: niceId,
    Queue: Queue
  };
})();
