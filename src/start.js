
/**
 * Start point for all measurements
 */

var start = (supports.performance && supports.performance.timing && supports.performance.timing.navigationStart)
  ? supports.performance.timing.navigationStart
  : (new Date()).valueOf();