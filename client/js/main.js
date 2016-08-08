function main() {
  const PING_COUNT = 10;

  var id = Utility.guid();
  console.log('client id', id);

  var url = new URL(window.location.href);
  var peer = url.searchParams.get('peer');

  function printPingResults(results) {
    DOM.p('pinged results ' + results);
    DOM.p('mean is ' + Utility.mean(results));
    DOM.p('standard deviation is ' + Utility.stddev(results));
  }

  function pingSerial(count, cb) {
    var results = [];
    (function pingNext(curPing) {
      if (curPing < count) {
        Latency.ping(id, peer, (err, result) => {
          if (err) {
            console.log('ping error', err);
          } else {
            results.push(result);
          }
          pingNext(++curPing);
        })
      } else {
        cb(null, results);
      }
    })(0);
  }

  if (peer) {
    console.log('attempting to connect to peer', peer);
    pingSerial(PING_COUNT, (err, results) => {
      printPingResults(results);
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
