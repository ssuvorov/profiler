;(function (undefined) {
'use strict';
var typeOf = (function (){
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
 * Iterates through array or object
 * If first argument has a plain type callback will be invoked once
 */
var each = (function (typeOf) {
  var supportsForEach = 'forEach' in Array.prototype;

  return function (obj, fn, ctx) {
    var type = typeOf(obj);
    if (type === 'array') {
      if (supportsForEach) {
        obj.forEach(fn, ctx || window);
      } else {
        for (var i = 0, len = obj.length; i < len; i++) {
          fn.call(ctx, obj[i], i);
        }
      }
    } else if (type === 'object') {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          fn.call(ctx, obj[key], key);
        }
      }
    } else {
      fn.call(ctx, obj);
    }
  };
}(typeOf));
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
//
var start = window.__profiler__start__ = window.__profiler__start__ || (new Date()).valueOf();

var Record = (function () {
  return function (key, name) {
    this.key = key;
    this.name = name;
    this.start = (new Date()).valueOf() - start;
    this.completed = false;
  };
}());

Record.prototype = {
  complete: function () {
    this.end = (new Date()).valueOf() - start;
    this.duration = this.end - this.start;
    this.completed = true;
  },

  toString: function (){
    return this.name + ' ' + this.start + '-' + this.end + ' (' + this.duration + ')';
  }
};
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
}());