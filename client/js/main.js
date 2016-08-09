function main() {
  const PING_COUNT = 10;

  var id = Utility.guid();
  console.log('client id', id);

  var url = new URL(window.location.href);
  var peer = url.searchParams.get('peer');
  var helper = new LatencyHelper(id);

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

  helper.onResults((sender, recipient, results) => {
    DOM.p(`pinged results from ${niceId(sender)} to ${niceId(recipient)}: ${results}`);
    DOM.p('mean is ' + Utility.mean(results));
    DOM.p('standard deviation is ' + Utility.stddev(results));
  });

  helper.onConnection(peerId => {
    DOM.p(`new connection: ${niceId(peerId)}`);
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
          DOM.p(`could not connect to ${niceId(peer)}, ${err}`);
          printPeerLink();
          return;
        }

        helper.pingTest(peer, PING_COUNT, err => {
          if (!err) {
            DOM.p(`finished ping test with ${niceId(peer)}`);
          }
        });
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', main);
