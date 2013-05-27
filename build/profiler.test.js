window.TIMING_FIXTURE = { a: 1, b: 2 };
window.MEMORY_FIXTURE = { a: 1, b: 2 };
window.RESOURCE_FIXTURE = ['a', 'b'];

window.performance = {
  timing: TIMING_FIXTURE,
  memory: MEMORY_FIXTURE,
  getEntries: RESOURCE_FIXTURE
};

/**
 * Detect some browser feature supporting
 */

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

/**
 * Replacing typeof
 * @param arg {*} Any argument
 * @return {String} Type of argument
 */

var typeOf = (function () {
  var objectToString = Object.prototype.toString;
  var class2type = {};
  var classNames = ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object', 'Error'];

  for (var i = 0, len = classNames.length; i < len; i++) {
    var className = classNames[i];
    class2type['[object ' + className + ']'] = className.toLowerCase();
  }

  return function (arg) {
    if (arg === null) {
      return 'null';
    }
    return typeof arg === 'object' || typeof arg === 'function' ? class2type[objectToString.call(arg)] || 'object' : typeof arg;
  };
}());

/**
 * @require typeOf
 *
 * Iterates through array or object
 * If first argument has a plain type callback will be invoked once
 *
 * @TODO: optimize by creating different versions depends on browser support
 */

var each = (function (typeOf) {
  var supportsForEach = 'forEach' in Array.prototype;

  return function (obj, fn, ctx) {
    var type = typeOf(obj);

    if (type === 'array') {
      if (supportsForEach) {
        obj.forEach(fn, ctx);
      } else {
        for (var i = 0, len = obj.length; i < len; i++) {
          fn.call(ctx, obj[i], i);
        }
      }
    } else if (type === 'object') {
      for (var key in obj) {
        fn.call(ctx, obj[key], key);
      }
    } else {
      fn.call(ctx, obj);
    }
  };
}(typeOf));

/**
 * Filter array or object
 * @todo: optimize by creating different versions depends on browser support
 *
 * @param arg {Array|Object}
 * @param fn {Function} Callback for filtering
 * @param ctx {Object} Context for callback. Optional
 *
 * @return {Array|Object} New array or object contains filtered items
 */

var filter = (function (each, typeOf) {
  var supportsFilter = 'filter' in Array.prototype;

  return function (arg, fn, ctx) {
    var type = typeOf(arg);
    var result;

    if (type === 'array') {
      if (supportsFilter) {
        result = arg.filter(fn, ctx);
      } else {
        result = [];
        each(arg, function (item, index) {
          if (fn.call(ctx, item, index)) {
            result.push(item);
          }
        }, ctx);
      }
    } else if (type === 'object') {
      result = {};
      each(arg, function (item, key) {
        if (fn.call(ctx, item, key)) {
          result[key] = item;
        }
      }, ctx);
    }

    return result;
  };
}(each, typeOf));

/**
 * @TODO: need refactoring
 * Very simple http-provider
 * for POST-requests
 */

var http = (function () {
  var win = window;

  /**
   * Creates XHR under browser
   * and ActiveX under IE
   */

  var createXhr = (function () {
    if (win.XMLHttpRequest) {
      return function () {
        return new win.XMLHttpRequest();
      };
    } else {
      var ActiveXObj = win.ActiveXObject;
      return function () {
        try { return new ActiveXObj('Microsoft.XMLHTTP'); } catch(e) {}
        try { return new ActiveXObj('Msxml2.XMLHTTP.6.0'); } catch(e) {}
        try { return new ActiveXObj('Msxml2.XMLHTTP.3.0'); } catch(e) {}
        try { return new ActiveXObj('Msxml2.XMLHTTP'); } catch(e) {}
        return null;
      };
    }
  }());

  /**
   * Creates new XHR and sends request to server
   * @param params {Object}
   * @return {Object} XMLHttpRequest
   */

  var sendRequest = function (params) {
    var xhr = createXhr();

    xhr.onload = function () {
      if (xhr.status === 200) {
        params.success(xhr.response);
      }
    };

    xhr.onerror = function (err) {
        params.error(err);
    };

    xhr.open(params.method, params.url, true);

    xhr.send(JSON.stringify(params.data));

    return xhr;
  };


  return {
    post: function (url, data, success, error) {
      return sendRequest({
        method: 'post',
        url: url,
        data: data,
        success: function (response) {
          if (success) {
            success.call(window, response);
          }
        },
        error: function (err) {
          if (error) {
            error(err);
          }
        }
      });
    }
  };
}());

/**
 * Start point for all measurements
 */

var start = (supports.performance && supports.performance.timing && supports.performance.timing.navigationStart)
  ? supports.performance.timing.navigationStart
  : (new Date()).valueOf();

/**
 * Record constructor
 * @TODO use window.performance.now
 */

var Record = function (name, tags) {
  this.name = name;
  this.tags = tags;
  this.start = (new Date()).valueOf() - start;
  this.completed = false;
};

Record.prototype = {

  /**
   * Calculate duration and set completed state.
   */

  complete: function () {
    this.end = (new Date()).valueOf() - start;
    this.duration = this.end - this.start;
    this.completed = true;
  },

  /**
   * Pretty print
   */

  toString: function () {
    return this.name + ' ' + this.start + '-' + this.end + ' (' + this.duration + ')';
  }
};

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

/**
 * Profiler
 */

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
     * @TODO: properly clear timing
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