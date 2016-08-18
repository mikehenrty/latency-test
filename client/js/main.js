function main() {
  const PING_COUNT = 100;

  function printPeerLink() {
    DOM.link(Utility.getPeerLink(), 'Link to connect to this browser.', true);
  }

  var id = Utility.getClientId();
  var peer = Utility.getPeerId();
  var latencyHelper = new LatencyHelper(id);

  var allResults = {};
  latencyHelper.onResults((sender, recipient, results) => {
    var peerId = recipient !== id ? recipient : sender;
    allResults[peerId] = allResults[peerId] || [];
    allResults[peerId].push.apply(allResults[peerId], results);
    results = allResults[peerId];
    var mean = Utility.mean(results);
    var stddev = Utility.stddev(results);
    DOM.resultTable.add(Utility.niceId(peerId), results.length, mean, stddev);
  });

  if (!peer) {
    printPeerLink();
    latencyHelper.listen();
    return;
  }

  latencyHelper.pingTest(peer, PING_COUNT, err => {
    if (err) {
      DOM.p(`could not connect to ${Utility.niceId(peer)}`);
      printPeerLink();
      return;
    }

    DOM.p(`finished ping test with ${Utility.niceId(peer)}`);
  });

}

document.addEventListener('DOMContentLoaded', main);
