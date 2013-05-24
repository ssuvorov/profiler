var start = (supports.timing && window.performance.timing.navigationStart)
  ? window.performance.timing.navigationStart
  : (new Date()).valueOf();