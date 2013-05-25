
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