(function (each, filter, on, off, Record) {
  var win = window;
  var doc = win.document;

  var supportsTiming = ('performance' in win && 'timing' in win.performance);

  var EVT_DOM_READY = 'DOMContentLoaded';
  var EVT_LOAD = 'load';

  var start = window.__profiler__start__ = window.__profiler__start__ || (new Date()).valueOf();

  var domReady, windowLoad;

  var records = [];
  var index = {};

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
    },


    /**
     * Add new record
     * @param name {String} Record name
     */
    start: function (name) {
      var record = new Record(name, name);
      records.push(record);
      index[name] = record;
    },


    /**
     * Stop record by name
     * @param name {String} Record name
     */
    stop: function (name) {
      index[name].complete();
    },


    /**
     * Alias for `stop`
     */
    end: function () {
      this.stop.call(this, arguments);
    },


    /**
     * Returns records
     */
    report: function () {
      return {
        onready: domReady,
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
    },


    /**
     * Send report to server
     */
    send: function () {
      //
    },


    /**
     * Setup profiler
     */
    setup: function () {
      //
    }
  };



  /*** Helpers ***/

  var buildIndex = function () {
    var index = {};
    each(records, function (record) {
      index[record.key] = record;
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
    var timing;

    if (supportsTiming) {
      timing = {};
      each(window.performance.timing, function (value, key) {
        if (value > 0) {
          timing[key] = value - start;
        }
      });
    }
    console.log(timing);
    return timing || null;
  };


  var onLoad = function () {
    off(win, EVT_LOAD, onLoad);
    windowLoad = (new Date()).valueOf() - start;
  };


  var onDomReady = function () {
    off(doc, EVT_DOM_READY, onDomReady);
    domReady = (new Date()).valueOf() - start;
  };


  /*** Listen events ***/

  on(doc, EVT_DOM_READY, onDomReady);
  on(win, EVT_LOAD, onLoad);

}(each, filter, on, off, Record));