(function () {
  var start = window.__profiler__start__ || (new Date()).valueOf();

  window.Record = function (key, name) {
    this.key = key;
    this.name = name;
    this.start = (new Date()).valueOf() - start;
    this.completed = false;
  };

  Record.prototype = {
    complete: function () {
      this.end = (new Date()).valueOf() - start;
      this.duration = this.end - this.start;
      this.completed = true;
    },

    toString: function (){
      return this.name + ' ' + this.start + '-' + this.end + ' (' + this.duration + ')';
    }
  }
}());