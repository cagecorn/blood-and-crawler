import { MOVE_REQUEST, PLAYER_MOVED } from '../events/eventTypes.js';

export const movementSystem = (bus, state) => {
  const id = 'movement';

  const init = () => {
    bus.on(MOVE_REQUEST, ({ id: entityId, x, y }) => {
      const entity = state.entities.get(entityId);
      if (entity?.position) {
        entity.position.x = x;
        entity.position.y = y;
        bus.emit(PLAYER_MOVED, { id: entityId, x, y });
      }
    });
  };

  const update = () => {};

  return { id, init, update };
};
