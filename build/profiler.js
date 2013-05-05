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
    return typeof arg === 'object' || typeof arg === 'function'
      ? class2type[objectToString.call(arg)] || 'object'
      : typeof arg;
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
  }
}(each, typeOf));
var start;

if (window.__profiler__start__) {
  start = window.__profiler__start__;
  try {
    delete window.__profiler__start__;
  } catch (e) {
    //
  }
} else {
  start = (new Date()).valueOf();
}

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
}());