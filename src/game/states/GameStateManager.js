import { debugLogManager } from '../../utils/DebugLogManager.js';

export const GameStates = {
  DUNGEON: 'DungeonExplorationState',
  COMBAT: 'CombatState'
};

class GameStateManager {
  init(game) {
    this.game = game;
    this.currentState = null;
  }

  changeState(stateKey, data) {
    if (!this.game) {
      throw new Error('GameStateManager not initialized');
    }
    debugLogManager.log('State change', {
      from: this.currentState,
      to: stateKey
    });
    this.currentState = stateKey;
    this.game.scene.start(stateKey, data);
  }
}

export const gameStateManager = new GameStateManager();
