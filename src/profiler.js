(function () {
  var start = window.__profiler__start__ || (new Date()).valueOf();

  var records = {};

  window.profiler = {
    /**
     * Remove all completed records
     */
    clear: function () {

    },


    /**
     * Add new record
     * @param name {String} Record name
     */
    start: function (name) {
      //
    },


    /**
     * Stop record by name
     * @param name {String} Record name
     */
    stop: function (name) {
      //
    },


    /**
     * Alias for `stop`
     */
    end: function (name) {
      this.stop.call(this, arguments);
    },


    /**
     * Returns records
     */
    report: function () {
      return records;
    },


    /**
     * Reset profiler to default state
     */
    reset: function () {
      //
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
}());