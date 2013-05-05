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
