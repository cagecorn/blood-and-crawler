import { PLAYER_MOVED, MONSTERS_TURN_START, MONSTERS_TURN_END } from '../events/eventTypes.js';

export const turnManager = (bus) => {
  const id = 'turn-manager';
  let playerTurn = true;

  const init = () => {
    bus.on(PLAYER_MOVED, () => {
      playerTurn = false;
      bus.emit(MONSTERS_TURN_START);
    });
    bus.on(MONSTERS_TURN_END, () => {
      playerTurn = true;
    });
  };

  const canPlayerAct = () => playerTurn;

  return { id, init, canPlayerAct };
};
