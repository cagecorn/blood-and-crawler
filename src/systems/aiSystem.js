// AI decision making placeholder
import { MONSTERS_TURN_START, MONSTERS_TURN_END } from '../events/eventTypes.js';

export const aiSystem = (bus, state) => {
  const id = 'ai';

  const init = () => {
    bus.on(MONSTERS_TURN_START, () => {
      // Placeholder for simultaneous monster actions
      bus.emit(MONSTERS_TURN_END);
    });
  };

  const update = () => {};

  return { id, init, update };
};
