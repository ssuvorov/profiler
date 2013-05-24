var supports = supports || {};

(function () {
  var perf = window.performance || window.webkitPerformance ||
    window.mozPerformance || window.msPerformance || false;

  supports.performance = perf || false;

  if (supports.performance) {
    var getEntries = perf.getEntries || perf.webkitGetEntries || perf.mozGetEntries || perf.msGetEntries || false;

    supports.performance.timing = 'timing' in perf;
    supports.performance.memory = 'memory' in perf;
    supports.performance.getEntries = getEntries || false;
  }
}());
