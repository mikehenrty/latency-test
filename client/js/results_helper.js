window.ResultsHelper = (function() {
  'use strict';

  function ResultsHelper(clientId) {
    this.clientId = clientId;
    this.results = {};
  }

  ResultsHelper.prototype.whichIsPeer = function(id1, id2) {
    return id1 !== this.clientId ? id1 : id2;
  };

  ResultsHelper.prototype.addResults = function(peerId, type, results) {
    this.results[peerId] = this.results[peerId] || {};
    this.results[peerId][type] = this.results[peerId][type] || [];
    var cur = this.results[peerId][type];
    cur.push.apply(cur, results);
  };

  ResultsHelper.prototype.getResultsForPeer = function(peerId, type) {
    if (!this.results[peerId]) {
      return [];
    }
    return this.results[peerId][type] || [];
  };

  return ResultsHelper;
})();
