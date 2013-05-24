window.profiler = (function (win) {
  var records = [];
  var calls = {};
  var index = {};
  var timing = {};

  var session = (new Date()).valueOf() + (Math.random() * 1000|0);

  var url;
  var interval = 30;
  var firstInterval = 10;
  var _interval;

  var SEND = false;

  /**
   * Builds index for records by name
   */

  var buildIndex = function () {
    var index = {};
    each(records, function (record) {
      var name = record.name;
      index[name] = index[name] || [];
      index[name].push(record);
    });
    return index;
  };

  /**
   * Finds all completed records
   */

  var getCompleted = function () {
    return filter(records, function (record) {
      return record.completed === true;
    });
  };

  /**
   * Finds all not-completed records
   */

  var getPending = function () {
    return filter(records, function (record) {
      return record.completed === false;
    });
  };

  /**
   * Starts reporting
   */

  var sendReport = function () {
    setTimeout(function () {
      if (SEND) {
        win.profiler.send();
        win.profiler.clear();

        sendReport();
      }
    }, _interval * 1000);
  };


  /**
   * Public API
   */

  return {

    /**
     * Remove all completed records
     */

    clear: function () {
      records = getPending();
      index = buildIndex();
      calls = {};
      timing = {};
    },

    /**
     * Count something
     * @param name {String} Name of counting object
     */

    count: function (name) {
      calls[name] = calls[name] || 0;
      calls[name]++;
    },

    /**
     * Meter reflow using zero timeout
     * @param name {String} Record name
     * @param tags {Array} List of tags
     */

    reflow: function (name, tags) {
      tags = tags || ['reflow'];
      this.start(name, tags);
      this.stop(name, true);
    },

    /**
     * Add new record
     * @param name {String} Record name
     * @param tags {Array} List of tags
     */

    start: function (name, tags) {
      var record = new Record(name, tags || ['script']);

      records.push(record);
      index[name] = index[name] || [];
      index[name].push(record);
    },

    /**
     * Stop record by name
     * @param name {String} Record name
     * @param async {Boolean} If true record will be stopped in zero timeout
     */

    stop: function (name, async) {
      if (async) {
        setTimeout(function () {
          index[name].shift().complete();
        }, 0);
      } else {
        index[name].shift().complete();
      }
    },

    /**
     * Alias for `stop`
     */

    end: function () {
      this.stop.apply(this, arguments);
    },

    /**
     * Returns records
     */

    report: function () {
      return report({
        calls: calls,
        records: getCompleted()
      });
    },

    /**
     * Reset profiler to default state
     */

    reset: function () {
      records = [];
      index = {};
      calls = {};
      timing = {};
    },

    /**
     * Send report to server
     */

    send: function () {
      if (url) {
        var report = this.report();
        http.post(url, {
          calls: report.calls,
          memory: report.memory,
          records: report.records,
          session: session,
          timing: timing
        });
      }
    },

    /**
     * Setup profiler
     */

    setup: function (params) {
      url = params.url || url;
      session = params.session || session;
      interval = params.interval || interval;
      firstInterval = params.firstInterval || firstInterval;

      _interval = interval;
    },

    /**
     * Starts reporting to server every `interval` seconds
     */

    startReporting: function () {
      SEND = true;
      _interval = firstInterval;
      sendReport();
      _interval = interval;
    },

    /**
     * Stops reporting to server
     */

    stopReporting: function () {
      SEND = false;
    }

  };
}(window));