'use strict';

console.debug = function() {
  if (console.DEBUG) {
    console.log.apply(console, arguments);
  }
};

module.exports = console;
