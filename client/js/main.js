function main() {
  var id = Utility.guid();
  console.log('client id', id);

  var url = new URL(window.location.href);
  var peer = url.searchParams.get('peer');

  if (peer) {
    console.log('attempting to connect to peer', peer);
    Latency.connect(id, peer);
  } else {
    console.log('waiting for connection');
    Latency.listen(id);
  }
}

document.addEventListener('DOMContentLoaded', main);
