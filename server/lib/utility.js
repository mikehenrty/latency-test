'use strict';

var clientCount = 0;
var clientNames = {};

module.exports = {
  guidToNiceName: function(guid) {
    if (guid === '') {
      return '';
    }
    if (clientNames[guid]) {
      return clientNames[guid]
    }
    clientNames[guid] = 'client_' + ++clientCount;
    return clientNames[guid];
  },

  getPathFromUrl: function(url) {
    url = url.split('?')[0];
    if (url.endsWith('/')) {
      url += 'index.html';
    }
    return url;
  }
};
