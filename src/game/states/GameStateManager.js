export const GameStates = {
  DUNGEON: 'DungeonExplorationState',
  COMBAT: 'CombatState'
};

class GameStateManager {
  init(game) {
    this.game = game;
  }

  changeState(stateKey) {
    if (!this.game) {
      throw new Error('GameStateManager not initialized');
    }
    this.game.scene.start(stateKey);
  }
}

export const gameStateManager = new GameStateManager();
