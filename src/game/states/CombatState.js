import { Scene } from 'phaser';
import { gameStateManager, GameStates } from './GameStateManager.js';
import { MeasurementManager } from '../../MeasurementManager.js';
import { debugLogManager } from '../../utils/DebugLogManager.js';

export class CombatState extends Scene {
  constructor() {
    super(GameStates.COMBAT);
  }

  create() {
    debugLogManager.log('Combat state entered');
    const { centerX, centerY } = MeasurementManager;

    this.add.text(centerX, centerY, 'Combat', {
      fontFamily: 'Arial',
      fontSize: MeasurementManager.fontSizes.default,
      color: '#ffffff'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      debugLogManager.log('Combat pointerdown');
      gameStateManager.changeState(GameStates.DUNGEON);
    });
  }
}
