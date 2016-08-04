window.DOM = (function() {

  return {
    link: function(href) {
      var link = document.createElement('a');
      link.href = href;
      link.textContent = href;
      return link;
    },

    p: function(text) {
      var p = document.createElement('p');
      p.textContent = text;
      return p;
    },

    add: function(el) {
      document.body.appendChild(el);
    }
  };
})();
