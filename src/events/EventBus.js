// Simple event bus for decoupled communication between systems

export class EventBus {
  constructor() {
    this.listeners = {};
  }

  on(type, handler) {
    if (!this.listeners[type]) {
      this.listeners[type] = new Set();
    }
    this.listeners[type].add(handler);
    return () => this.listeners[type]?.delete(handler);
  }

  emit(type, payload) {
    this.listeners[type]?.forEach((handler) => handler(payload));
  }
}

export const eventBus = new EventBus();
