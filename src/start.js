var start;
var supportsPerformance = ('performance' in window);
var supportsTiming = (supportsPerformance && 'timing' in window.performance);
var supportsMemory = (supportsPerformance && 'memory' in window.performance);

if (supportsTiming && window.performance.timing.navigationStart) {
  start = window.performance.timing.navigationStart;
} else {
  start = window.__profiler__start__ = window.__profiler__start__ || (new Date()).valueOf();
}