'use strict';

var clientCount = 0;
var clientNames = {};

function guidToNiceName(guid) {
  if (guid === '') {
    return '---';
  }
  if (clientNames[guid]) {
    return clientNames[guid]
  }
  clientNames[guid] = 'client_' + ++clientCount;
  return clientNames[guid];
}

module.exports = {
  guidToNiceName: function(guid) {
    if (Array.isArray(guid)) {
      return guid.map(id => {
        return guidToNiceName(id);
      });
    }

    return guidToNiceName(guid);
  },

  getPathFromUrl: function(url) {
    url = url.split('?')[0];
    if (url.endsWith('/')) {
      url += 'index.html';
    }
    return url;
  }
};
