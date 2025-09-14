import { Scene } from 'phaser';
import { gameStateManager, GameStates } from './GameStateManager';

export class CombatState extends Scene {
  constructor() {
    super(GameStates.COMBAT);
  }

  create() {
    this.add.text(512, 384, 'Combat', {
      fontFamily: 'Arial',
      fontSize: 24,
      color: '#ffffff'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      gameStateManager.changeState(GameStates.DUNGEON);
    });
  }
}
