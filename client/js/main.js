function main() {
  var id = Utility.guid();
  console.log('client id', id);

  var url = new URL(window.location.href);
  var peer = url.searchParams.get('peer');

  if (peer) {
    console.log('attempting to connect to peer', peer);
    Latency.connect(id, peer, err => {
      if (!err) {
        DOM.p('connnected to ' + peer);
      }
    });
  } else {
    console.log('waiting for connection');
    Latency.listen(id, err => {
      if (err) {
        DOM.p('could not register new master');
      } else {
        DOM.link(window.location.href + '?peer=' + id);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', main);
