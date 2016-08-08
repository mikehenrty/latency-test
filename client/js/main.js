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

  function niceId(guid) {
    return id === guid ? 'ME' : guid;
  }

  helper.onResults((sender, recipient, results) => {
    DOM.p(`pinged results from ${niceId(sender)} to ${niceId(recipient)}: ${results}`);
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
      helper.connect(peer, err => {
        if (err) {
          DOM.p(`could not connect to ${peer}, ${err}`);
          printPeerLink();
          return;
        }

        helper.pingTest(peer, PING_COUNT, err => {
          if (!err) {
            DOM.p(`finished ping test with ${peer}`);
          }
        });
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', main);
