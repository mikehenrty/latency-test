function main() {
  const PING_COUNT = 10;

  var id = Utility.guid();
  console.log('client id', id);

  var url = new URL(window.location.href);
  var peer = url.searchParams.get('peer');
  var helper = new LatencyHelper(id);

  function printPeerLink() {
    DOM.link(window.location.href + '?peer=' + id);
  }

  helper.onResults(results => {
    DOM.p('pinged results ' + results);
    DOM.p('mean is ' + Utility.mean(results));
    DOM.p('standard deviation is ' + Utility.stddev(results));
  });

  helper.onConnection(peerId => {
    DOM.p(`new connection: ${peerId}`);
  });

  helper.init(err => {
    if (err) {
      DOM.p(`error setting up, ${err}`);
      return;
    }

    if (!peer) {
      printPeerLink();
    }

    if (peer) {
      helper.pingTest(peer, PING_COUNT, err => {
        if (!err) {
          DOM.p(`finished ping test with ${peer}`);
        }
      });

      // TODO: add handshake message.
      // helper.connect(peer, err => {
      //   if (err) {
      //     DOM.p(`could not connect to ${peer}, ${err}`);
      //     printPeerLink();
      //     return;
      //   }

      // });
    }
  });
}

document.addEventListener('DOMContentLoaded', main);
