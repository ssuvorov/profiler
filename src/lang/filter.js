
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