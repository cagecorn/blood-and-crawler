import { eventBus } from '../../../events/EventBus.js';
import { CAST_SPELL } from '../../../events/eventTypes.js';

export const magicSystem = {
  start() {
    this.unsubscribe = eventBus.on(CAST_SPELL, (spell) => {
      console.log('Casting spell', spell);
    });
  },
  stop() {
    this.unsubscribe?.();
    this.unsubscribe = null;
  },
};
