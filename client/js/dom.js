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
      resultTable.updateRow(tr, 'Name', 'Sample Size',
                            'Average', 'Std Dev');
    },

    getRow: function(id) {
      var tr = document.getElementById(id);
      if (tr) {
        return tr;
      }

      tr = document.createElement('tr');
      tr.id = id;
      tr.peerCell = document.createElement('th');
      tr.sizeCell = document.createElement('th');
      tr.meanCell = document.createElement('th');
      tr.stddevCell = document.createElement('th');

      tr.appendChild(tr.peerCell);
      tr.appendChild(tr.sizeCell);
      tr.appendChild(tr.meanCell);
      tr.appendChild(tr.stddevCell);
      return tr;
    },

    updateRow: function(row, peer, sampleSize, mean, stddev) {
      row.peerCell.textContent = peer;
      row.sizeCell.textContent = sampleSize;
      row.meanCell.textContent = mean;
      row.stddevCell.textContent = stddev;
    },

    add: function(peer, sampleSize, mean, stddev) {
      resultTable.ensure();
      var row = resultTable.getRow(peer);
      tbody.appendChild(row);
      resultTable.updateRow(resultTable.getRow(peer), peer, sampleSize,
                            mean.toFixed(3), stddev.toFixed(3));
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
