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
      var tr = resultTable.getRow('connection', 'results', 'std dev', 'mean');
      thead.appendChild(tr);
      table.appendChild(thead);
      table.appendChild(tbody);
      document.body.appendChild(table);
    },

    getRow: function(connText, resultsText, stddevText, meanText) {
      var tr = document.createElement('tr');
      var connCell = document.createElement('th');
      var resultsCell = document.createElement('th');
      var stddevCell = document.createElement('th');
      var meanCell = document.createElement('th');

      connCell.textContent = connText;
      resultsCell.textContent = resultsText;
      stddevCell.textContent = stddevText;
      meanCell.textContent = meanText;

      tr.appendChild(connCell);
      tr.appendChild(resultsCell);
      tr.appendChild(stddevCell);
      tr.appendChild(meanCell);
      return tr;
    },

    add: function(sender, recipienct, results, stddev, mean) {
      resultTable.ensure();
      var tr = resultTable.getRow(`${sender} -> ${recipienct}`,
                                  results, stddev, mean);
      tbody.appendChild(tr);
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
