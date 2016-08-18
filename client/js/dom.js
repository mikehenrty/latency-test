window.DOM = (function() {

  var table, tbody;
  var resultTable = {
    ensure: function() {
      if (table && tbody) {
        return;
      }
      table = document.createElement('table');
      table.id = 'result-table';
      tbody = document.createElement('tbody');
      var thead = document.createElement('thead');
      var tr = resultTable.getRow('header');
      thead.appendChild(tr);
      table.appendChild(thead);
      table.appendChild(tbody);
      document.body.appendChild(table);
      resultTable.updateRow(tr, 'Name',
                            'WebRTC', 'WebRTC Avg', 'StdDev',
                            'WebSocket', 'WebSocket Avg', 'StdDev');
    },

    getRow: function(id) {
      var tr = document.getElementById(id);
      if (tr) {
        return tr;
      }

      tr = document.createElement('tr');
      tr.id = id;
      tr.peerCell = document.createElement('th');
      tr.iSizeCell = document.createElement('th');
      tr.iMeanCell = document.createElement('th');
      tr.iStddevCell = document.createElement('th');
      tr.dSizeCell = document.createElement('th');
      tr.dMeanCell = document.createElement('th');
      tr.dStddevCell = document.createElement('th');

      tr.appendChild(tr.peerCell);
      tr.appendChild(tr.iSizeCell);
      tr.appendChild(tr.iMeanCell);
      tr.appendChild(tr.iStddevCell);
      tr.appendChild(tr.dSizeCell);
      tr.appendChild(tr.dMeanCell);
      tr.appendChild(tr.dStddevCell);
      return tr;
    },

    updateRow: function(row, peer, iSampleSize, iMean, iStddev,
                                   dSampleSize, dMean, dStddev) {
      row.peerCell.textContent = peer;
      row.iSizeCell.textContent = iSampleSize;
      row.iMeanCell.textContent = iMean;
      row.iStddevCell.textContent = iStddev;
      row.dSizeCell.textContent = dSampleSize;
      row.dMeanCell.textContent = dMean;
      row.dStddevCell.textContent = dStddev;
    },

    update: function(peer, iSampleSize, iMean, iStddev,
                        dSampleSize, dMean, dStddev) {
      resultTable.ensure();
      var row = resultTable.getRow(peer);
      tbody.appendChild(row);
      resultTable.updateRow(resultTable.getRow(peer), peer,
                            iSampleSize, iMean.toFixed(3), iStddev.toFixed(3),
                            dSampleSize, dMean.toFixed(3), dStddev.toFixed(3));
    }
  };

  return {
    link: function(href, text, blank) {
      var link = document.createElement('a');
      link.href = href;
      link.textContent = text || href;
      if (blank) {
        link.setAttribute('target', '_blank');
      }
      DOM.add(link);
      return link;
    },

    p: function(text) {
      var p = document.createElement('p');
      p.textContent = text;
      DOM.add(p);
      return p;
    },

    add: function(el) {
      document.body.appendChild(el);
    },

    resultTable: resultTable
  };
})();
