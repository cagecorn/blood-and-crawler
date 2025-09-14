import { Scene } from 'phaser';
import { gameStateManager, GameStates } from './GameStateManager';
import { MeasurementManager } from '../../MeasurementManager';

export class CombatState extends Scene {
  constructor() {
    super(GameStates.COMBAT);
  }

  create() {
    const { centerX, centerY } = MeasurementManager;

    this.add.text(centerX, centerY, 'Combat', {
      fontFamily: 'Arial',
      fontSize: MeasurementManager.fontSizes.default,
      color: '#ffffff'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      gameStateManager.changeState(GameStates.DUNGEON);
    });
  }
}
