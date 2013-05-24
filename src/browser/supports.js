var supports = supports || {};

supports.performance = ('performance' in window);

supports.timing = (supports.performance && 'timing' in window.performance);
supports.memory = (supports.performance && 'memory' in window.performance);