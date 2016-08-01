(function() {
  'use strict';
  const WS_PORT = 8022;
  const WS_HOST = 'ws://' + window.location.hostname + ':' + WS_PORT;

  var socket;
  try {
    socket = new WebSocket(WS_HOST);
  } catch (e) {
    console.log('connection error ', e);
  }

  socket.addEventListener('message', event => {
    console.log('got message from server', event.data);
  });

  socket.addEventListener('open', () => {
    socket.send('world', error => {
      if (error) {
        console.log('socket send error ', error);
      }
    });
  });
})();
