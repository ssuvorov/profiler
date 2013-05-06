var start;
var supportsTiming = ('performance' in window && 'timing' in window.performance);

if (supportsTiming && window.performance.timing.navigationStart) {
  start = window.performance.timing.navigationStart;
} else {
  start = window.__profiler__start__ = window.__profiler__start__ || (new Date()).valueOf();
}