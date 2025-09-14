class DebugLogManager {
  constructor() {
    this.enabled = false;
    this.entries = [];
  }

  init(enabled = false) {
    this.enabled = enabled;
  }

  log(message, context = {}) {
    if (!this.enabled) {
      return;
    }
    const entry = {
      timestamp: new Date().toISOString(),
      message,
      context
    };
    this.entries.push(entry);
    // eslint-disable-next-line no-console
    console.debug(`[DEV] ${message}`, context);
  }

  getLogs() {
    return [...this.entries];
  }

  clear() {
    this.entries.length = 0;
  }
}

export const debugLogManager = new DebugLogManager();
