var report = (function (win) {
  var getMemoryInfo = function () {
    return supports.memory ? win.performance.memory : null;
  };

  var getTiming = function () {
    var timing = null;
    if (supports.performance) {
      timing = {};
      each(window.performance.timing, function (value, key) {
        if (value > 0) {
          timing[key] = value - start;
        }
      });
    }
    return timing;
  };

  return function (info) {
    return {
      calls: info.calls,
      memory: getMemoryInfo(),
      records: info.records,
      timing: getTiming()
    };
  };
}(window));