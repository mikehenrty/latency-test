function main() {
  const PING_COUNT = 100;

  function printPeerLink() {
    DOM.link(Utility.getPeerLink(), 'Link to connect to this browser.', true);
  }


  var clientId = Utility.getClientId();
  var peerId = Utility.getPeerId();
  var latencyHelper = new LatencyHelper(clientId);
  var resultsHelper = new ResultsHelper(clientId);

  latencyHelper.onResults((sender, recipient, results) => {
    var peerId = resultsHelper.whichIsPeer(sender, recipient);
    resultsHelper.addResults(peerId, results);
    var peerResults = resultsHelper.getResultsForPeer(peerId);
    var mean = Utility.mean(results);
    var stddev = Utility.stddev(results);
    DOM.resultTable.add(Utility.niceId(peerId), results.length, mean, stddev);
  });

  if (!peerId) {
    printPeerLink();
    latencyHelper.listen();
    return;
  }

  latencyHelper.pingTest(peerId, PING_COUNT, err => {
    if (err) {
      DOM.p(`could not connect to ${Utility.niceId(peerId)}`);
      printPeerLink();
      return;
    }

    DOM.p(`finished ping test with ${Utility.niceId(peerId)}`);
  });
}

document.addEventListener('DOMContentLoaded', main);
