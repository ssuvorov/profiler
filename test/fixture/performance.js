window.TIMING_FIXTURE = { a: 1, b: 2 };
window.MEMORY_FIXTURE = { a: 1, b: 2 };
window.RESOURCE_FIXTURE = function () {
  return ['a', 'b'];
};

window.performance = {
  timing: TIMING_FIXTURE,
  memory: MEMORY_FIXTURE,
  getEntries: RESOURCE_FIXTURE
};