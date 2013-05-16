(function (each, filter, on, off, start, Record) {
  var win = window;
  var doc = win.document;

  var EVT_DOM_READY = 'DOMContentLoaded';
  var EVT_LOAD = 'load';

  var domReady, windowLoad;

  var records = [];
  var calls = {};
  var index = {};
  var timing = {};

  var session = (new Date()).valueOf() + (Math.random() * 1000|0);

  var url;
  var interval = 30;
  var firstInterval = 10;
  var _interval;


  /**
   * Profiler
   */
  win.profiler = {
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
      return {
        onready: domReady,
        calls: calls,
        memory: getMemoryInfo(),
        records: getCompleted(),
        timing: getTiming(),
        onload: windowLoad
      };
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
      _interval = firstInterval;
      sendReport();
      _interval = interval;
    }
  };


  /*** Helpers ***/

  var buildIndex = function () {
    var index = {};
    each(records, function (record) {
      var name = record.name;
      index[name] = index[name] || [];
      index[name].push(record);
    });
    return index;
  };


  var getCompleted = function () {
    return filter(records, function (record) {
      return record.completed === true;
    });
  };


  var getPending = function () {
    return filter(records, function (record) {
      return record.completed === false;
    });
  };


  var getTiming = function () {
    var timing = null;
    if (supportsTiming) {
      timing = {};
      each(window.performance.timing, function (value, key) {
        if (value > 0) {
          timing[key] = value - start;
        }
      });
    }
    return timing;
  };


  var getMemoryInfo = function () {
    return supportsMemory ? win.performance.memory : null;
  };


  var onLoad = function () {
    off(win, EVT_LOAD, onLoad);
    windowLoad = (new Date()).valueOf() - start;
    setTimeout(function () {
      timing = getTiming();
    }, 0);
  };


  var onDomReady = function () {
    off(doc, EVT_DOM_READY, onDomReady);
    domReady = (new Date()).valueOf() - start;
  };


  /*** Listen events ***/

  on(doc, EVT_DOM_READY, onDomReady);
  on(win, EVT_LOAD, onLoad);


  /** start reporting */

  var sendReport = function () {
    setTimeout(function () {
      win.profiler.send();
      win.profiler.clear();

      sendReport();
    }, _interval * 1000);
  };


  /*** Clean-up ***/

  try {
    delete window.__profiler__start__;
  } catch (e) {
    //
  }
}(each, filter, on, off, start, Record));