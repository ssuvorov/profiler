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