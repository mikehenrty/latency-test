window.P2P = (function() {
  'use strict';

  window.RTCPeerConnection = window.RTCPeerConnection ||
                             window.webkitRTCPeerConnection;

  const CHANNEL_LABEL = 'p2p';

  function P2P(clientId, connection) {
    this.clientId = clientId;
    this.connection = connection;
    this.peerId = null;
    this.dataChannel = null;
    this.connectHandler = null;
    this.handlers = {};

    this.peerConnection = new RTCPeerConnection({
      'iceServers': [
        { 'urls': ['stun:stun.l.google.com:19302'] }
      ]
    });
    this.peerConnection.onicecandidate =
      this.candidateHandler.bind(this);
    this.peerConnection.oniceconnectionstatechange =
      this.stateChangeHandler.bind(this);
    this.connection.registerHandler('signaling',
      this.signalHandler.bind(this));
    this.peerConnection.ondatachannel =
      this.dataChannelHandler.bind(this);
  }

  P2P.prototype.isConnected = function() {
    return this.dataChannel && this.dataChannel.readyState === 'open';
  };

  P2P.prototype.connect = function(peerId, cb) {
    this.peerId = peerId;
    this.dataChannel = this.peerConnection.createDataChannel(CHANNEL_LABEL);
    this.dataChannel.onopen = this.dataChannel.onclose =
      this.dataChannelStateChange.bind(this);
    this.dataChannel.onmessage = this.onMessage.bind(this);

    this.connectHandler = cb;
    this.peerConnection.createOffer().then(offer => {
      this.peerConnection.setLocalDescription(offer);
      this.sendSignal('offer', offer);
    }).catch(err => {
      cb && cb(err);
    });
  };

  P2P.prototype.registerHandler = function(type, cb) {
    if (!this.handlers[type]) {
      this.handlers[type] = [];
    }
    this.handlers[type].push(cb);
  };

  P2P.prototype.send = function(type, peerId, payload, cb) {
    if (!this.dataChannel) {
      return cb && cb(`cannot send without data channel`);
    }
    if (peerId !== this.peerId) {
      return cb && cb(`cannot send to ${peerId}, connected to ${this.peerId}`);
    }
    this.dataChannel.send(`${type} ${payload}`);
  };

  P2P.prototype.onMessage = function(evt) {
    var parts = evt.data.split(' ');
    var type = parts.shift();
    var payload = parts.join(' ');
    var args = [null, this.peerId, payload];
    this.handlers[type] && this.handlers[type].forEach(handler => {
      handler.apply(null, args);
    });
  };


  P2P.prototype.candidateHandler = function(evt) {
    if (evt.candidate) {
      this.sendSignal('candidate', evt.candidate);
    }
  };

  P2P.prototype.sendSignal = function(signal, data) {
    this.connection.send('signaling', this.peerId,
    `${signal}|${JSON.stringify(data)}`);
  };

  P2P.prototype.signalHandler = function(err, peerId, message) {
    this.peerId = peerId;
    var parts = message.split('|');
    var type = parts.shift();
    try {
      var data = JSON.parse(parts.join('|'));
    } catch (err) {
      console.log('could not parse signaling message', err);
      return;
    }

    switch (type) {
      case 'candidate':
        this.peerConnection.addIceCandidate(
          new RTCIceCandidate(data)
        ).catch((err) => {
          console.log('error adding ice candidate', err, data);
        });
        break;

      case 'offer':
        this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(data)
        ).then(() => {
          return this.peerConnection.createAnswer();
        }).then(answer => {
          return this.peerConnection.setLocalDescription(answer);
        }).then(() => {
          this.sendSignal('answer',
            this.peerConnection.localDescription);
        }).catch(err => {
          console.log('error creating answer', err);
        });
        break;

      case 'answer':
        this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(data)
        );
        break;

      default:
        console.log('unrecognized signaling message', type);
        break;
    }
  };

  P2P.prototype.stateChangeHandler = function() {
    switch (this.peerConnection.iceConnectionState) {
      case 'connected':
        console.log('connected', this.peerId);
        break;
      case 'disconnected':
      case 'failed':
      case 'closed':
      default:
        console.log('new webrtc state',
          this.peerConnection.iceConnectionState);
    };
  };

  P2P.prototype.dataChannelHandler = function(evt) {
    this.dataChannel = evt.channel;
    this.dataChannel.onopen = this.dataChannel.onclose =
      this.dataChannelStateChange.bind(this);
    this.dataChannel.onmessage = this.onMessage.bind(this);
  };

  P2P.prototype.dataChannelStateChange = function(evt) {
    console.log('data channel state change', this.dataChannel.readyState);
    if (this.dataChannel.readyState === 'open') {
      var handler = this.connectHandler;
      this.connectHandler = null;
      handler && handler(null);
    }
  };

  return P2P;
})();
