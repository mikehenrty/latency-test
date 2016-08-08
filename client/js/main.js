function main() {
  var id = Utility.guid();
  console.log('client id', id);

  var url = new URL(window.location.href);
  var peer = url.searchParams.get('peer');

  if (peer) {
    console.log('attempting to connect to peer', peer);
    Latency.ping(id, peer, (err, result) => {
      if (!err) {
        DOM.p('ping result ' + result + 'ms');
      }
    });
  } else {
    console.log('waiting for connection');
    Latency.wait(id, err => {
      if (err) {
        DOM.p('could not register new master');
      } else {
        DOM.link(window.location.href + '?peer=' + id);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', main);
