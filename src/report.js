var report = (function (win) {
  var getMemoryInfo = function () {
    return supports.performance.memory ? win.performance.memory : null;
  };

  var getTiming = function () {
    var timing = null;
    if (supports.performance && supports.performance.timing) {
      timing = {};
      each(supports.performance.timing, function (value, key) {
        if (value > 0) {
          timing[key] = value - start;
        }
      });
    }
    return timing;
  };

  var getResourcesTiming = function () {
    var timing = null;
    if (supports.performance.getEntries) {
      timing = supports.performance.getEntries();
    }
    return timing;
  };

  return function (info) {
    return {
      calls: info.calls,
      memory: getMemoryInfo(),
      records: info.records,
      resources: getResourcesTiming(),
      timing: getTiming()
    };
  };
}(window));