window.DOM = (function() {

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
    }
  };
})();
