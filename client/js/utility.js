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
    this.tasks.pop()(this.handleDone);
  };

  Queue.prototype.add = function(task) {
    this.tasks.push(task);
    if (!this.running) {
      this.runNextTask();
    }
  };

  var clientCount = 0;
  var clientNames = {};
  function niceId(guid) {
    if (window.clientId && window.clientId === guid) {
      return 'Me';
    }
    if (clientNames[guid]) {
      return clientNames[guid]
    }
    clientNames[guid] = 'client_' + ++clientCount;
    return clientNames[guid];
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
      return Utility.sum(data) / data.length;
    },

    stddev: function(data) {
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
