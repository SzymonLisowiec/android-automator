class Logger {
  constructor (isDebugging) {
    this.isDebugging = isDebugging;
  }

  print (level, ...args) {
    if (level === 'debug' && !this.isDebugging) return;
    console[level](...args);
  }

  debug (...args) {
    this.print('debug', ...args);
  }

  log (...args) {
    this.print('debug', ...args);
  }

  warn (...args) {
    this.print('debug', ...args);
  }

  error (...args) {
    this.print('debug', ...args);
  }
}

module.exports = Logger;
