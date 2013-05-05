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