;(function (undefined) {
'use strict';
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
 * Attach event
 */
var on = (function (doc) {
  var slice = [].slice;
  var supportW3C = 'addEventListener' in doc;
  var on;

  if (supportW3C) {
    on = function (elem, eventName, handler, capture) {
      return elem.addEventListener(eventName, handler, capture || false);
    };
  } else {
    // todo: store links to original functions
//    var fixEvent = function (evt) {
//      // todo: fix event object
//      return evt;
//    };
//
//    var createHandler = function (handler) {
//      return function () {
//        var args = slice.apply(arguments);
//        args[0] = fixEvent(args[0]);
//        handler.call(this, args);
//      }
//    };
//
//    if ('attachEvent' in doc) {
//      on = function (elem, eventName, handler) {
//        return elem.attachEvent('on' + eventName, createHandler(handler));
//      }
//    } else {
//      on = function (elem, eventName, handler) {
//        elem['on' + eventName] = createHandler(handler);
//      }
//    }
  }

  return on;
}(window.document));


/**
 * Detach event
 */
var off = (function (doc) {
  var supportW3C = 'removeEventListener' in doc;
  var off;

  if (supportW3C) {
    off = function (elem, eventName, handler) {
      return elem.removeEventListener(eventName, handler);
    };
  } else {
    // todo: implement
//    if ('detachEvent' in doc) {
//      off = function (elem, eventName, handler) {
//        return elem.detachEvent(eventName, handler);
//      }
//    } else {
//
//    }
  }

  return off;
}(window.document));
var http = (function () {
  var win = window;

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
var start;
var supportsPerformance = ('performance' in window);
var supportsTiming = (supportsPerformance && 'timing' in window.performance);
var supportsMemory = (supportsPerformance && 'memory' in window.performance);

if (supportsTiming && window.performance.timing.navigationStart) {
  start = window.performance.timing.navigationStart;
} else {
  start = window.__profiler__start__ = window.__profiler__start__ || (new Date()).valueOf();
}
var Record = function (name, tags) {
  this.name = name;
  this.tags = tags;
  this.start = (new Date()).valueOf() - start;
  this.completed = false;
};

Record.prototype = {
  complete: function () {
    this.end = (new Date()).valueOf() - start;
    this.duration = this.end - this.start;
    this.completed = true;
  },

  toString: function () {
    return this.name + ' ' + this.start + '-' + this.end + ' (' + this.duration + ')';
  }
};
(function (each, filter, on, off, start, Record) {
  var win = window;
  var doc = win.document;

  var EVT_DOM_READY = 'DOMContentLoaded';
  var EVT_LOAD = 'load';

  var domReady, windowLoad;

  var records = [];
  var calls = {};
  var index = {};

  var session = (new Date()).valueOf() + (Math.random() * 1000|0);

  var url;
  var interval = 30;


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
    },


    /**
     * Send report to server
     */
    send: function () {
      if (url) {
        var report = this.report();
        report.session = session;
        http.post(url, report);
      }
    },


    /**
     * Setup profiler
     */
    setup: function (params) {
      url = params.url || url;
      session = params.session || session;
      interval = params.interval || interval;
    },


    /**
     * Starts reporting to server every `interval` seconds
     */
    startReporting: function () {
      sendReport();
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
    }, interval * 1000);
  };


  /*** Clean-up ***/

  try {
    delete window.__profiler__start__;
  } catch (e) {
    //
  }
}(each, filter, on, off, start, Record));
}());