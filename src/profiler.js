(function () {
  var start = window.__profiler__start__ || (new Date()).valueOf();

  var records = {};

  window.profiler = {
    /**
     *
     */
    clear: function () {

    },

    /**
     * @public
     * TBD
     */
    start: function (name) {
      //
    },

    /**
     *
     */
    stop: function () {
      this.end.call(this, arguments);
    },

    /**
     * @public
     * TBD
     */
    end: function (name) {
      //
    },

    /**
     * @public
     * TBD
     */
    report: function () {
      return records;
    },

    /**
     * @public
     * TBD
     */
    reset: function () {
      //
    },

    /**
     * @public
     * TBD
     */
    send: function () {
      //
    },

    /**
     * @public TBD
     */
    setup: function () {
      //
    }
  };
}());