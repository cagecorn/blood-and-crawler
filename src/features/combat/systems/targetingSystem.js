import { eventBus } from '../../../events/EventBus.js';
import { TARGET_SELECTED } from '../../../events/eventTypes.js';

export const targetingSystem = {
  start() {
    this.unsubscribe = eventBus.on(TARGET_SELECTED, (target) => {
      console.log('Target selected', target);
    });
  },
  stop() {
    this.unsubscribe?.();
    this.unsubscribe = null;
  },
};
