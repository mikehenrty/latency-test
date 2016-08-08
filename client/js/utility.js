window.Utility = (function() {
  'use strict';

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
    }
  };
})();
