(function (each, filter) {
  var records = [];
  var index = {};

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


  window.profiler = {
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
        records: getCompleted()
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
}(each, filter));