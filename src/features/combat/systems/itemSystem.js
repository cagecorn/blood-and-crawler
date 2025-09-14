import { eventBus } from '../../../events/EventBus.js';
import { ITEM_USED } from '../../../events/eventTypes.js';

export const itemSystem = {
  start() {
    this.unsubscribe = eventBus.on(ITEM_USED, (item) => {
      console.log('Item used', item);
    });
  },
  stop() {
    this.unsubscribe?.();
    this.unsubscribe = null;
  },
};
