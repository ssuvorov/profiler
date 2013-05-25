
/**
 * Simple reporter
 * @TODO create convenient reporter for development profiling
 */

var report = (function (win) {

  /**
   * Gets memory info if available
   */

  var getMemoryInfo = function () {
    return supports.performance.memory ? win.performance.memory : null;
  };

  /**
   * Gets timing info if available
   */

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

  /**
   * Gets info about resources loading timings if available
   */

  var getResourcesTiming = function () {
    var timing = null;
    if (supports.performance.getEntries) {
      timing = supports.performance.getEntries();
    }
    return timing;
  };

  /**
   * Reporter
   */

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