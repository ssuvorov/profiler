var start = (supports.performance && supports.performance.timing && window.performance.timing.navigationStart)
  ? supports.performance.timing.navigationStart
  : (new Date()).valueOf();