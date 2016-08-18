function main() {
  const PING_COUNT = 10;

  var id = Utility.guid();
  console.log('client id', id);

  var url = new URL(window.location.href);
  var peer = url.searchParams.get('peer');
  var latencyHelper = new LatencyHelper(id);

  function printPeerLink() {
    DOM.link(`${url.protocol}\/\/${url.host}${url.pathname}?peer=${id}`,
             'Click here to connect to this browser.', true);
  }

  var clientCount = 0;
  var clientNames = {};
  function niceId(guid) {
    if (id === guid) {
      return 'Me';
    }
    if (clientNames[guid]) {
      return clientNames[guid]
    }
    clientNames[guid] = 'client_' + ++clientCount;
    return clientNames[guid];
  }

  latencyHelper.onResults((sender, recipient, results) => {
    DOM.resultTable.add(niceId(sender), niceId(recipient),
                        results.map(val => val.toFixed(1)),
                        Utility.stddev(results).toFixed(3),
                        Utility.mean(results).toFixed(3));
  });

  if (!peer) {
    printPeerLink();
    latencyHelper.listen();
    return;
  }

  latencyHelper.pingTest(peer, PING_COUNT, err => {
    if (err) {
      DOM.p(`could not connect to ${niceId(peer)}`);
      printPeerLink();
      return;
    }

    DOM.p(`finished ping test with ${niceId(peer)}`);
  });
}

document.addEventListener('DOMContentLoaded', main);
