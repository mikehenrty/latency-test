function main() {
  const PING_COUNT = 100;
  const INDIRECT = Pinger.INDIRECT;
  const DIRECT = Pinger.DIRECT;

  function printPeerLink() {
    DOM.link(Utility.getPeerLink(), 'Link to connect to this browser.', true);
  }


  var clientId = Utility.getClientId();
  var peerId = Utility.getPeerId();
  var latencyHelper = new LatencyHelper(clientId);
  var resultsHelper = new ResultsHelper(clientId);

  latencyHelper.onResults((sender, recipient, type, results) => {
    var peerId = resultsHelper.whichIsPeer(sender, recipient);
    resultsHelper.addResults(peerId, type, results);

    var directResults = resultsHelper.getResultsForPeer(peerId, DIRECT);
    var directCount = directResults.length;
    var directMean = Utility.mean(directResults);
    var directStddev = Utility.stddev(directResults);

    var indirectResults = resultsHelper.getResultsForPeer(peerId, INDIRECT);
    var indirectCount = indirectResults.length;
    var indirectMean = Utility.mean(indirectResults);
    var indirectStddev = Utility.stddev(indirectResults);

    DOM.resultTable.update(Utility.niceId(peerId),
                           directCount, directMean, directStddev,
                           indirectCount, indirectMean, indirectStddev);
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
