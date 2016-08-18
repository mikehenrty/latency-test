function main() {
  const PING_COUNT = 100;

  var id = Utility.getClientId();
  var url = new URL(window.location.href);
  var peer = url.searchParams.get('peer');
  var latencyHelper = new LatencyHelper(id);

  function printPeerLink() {
    DOM.link(`${url.protocol}\/\/${url.host}${url.pathname}?peer=${id}`,
             'Click here to connect to this browser.', true);
  }

  var allResults = {};
  latencyHelper.onResults((sender, recipient, results) => {
    if (sender !== id && recipient !== id) {
      console.log('why did i get these results?', sender, recipient);
      return;
    }

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
