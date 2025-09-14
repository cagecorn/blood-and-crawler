import { Scene } from 'phaser';
import { gameStateManager, GameStates } from './GameStateManager';
import { MeasurementManager } from '../../MeasurementManager';
import { debugLogManager } from '../../utils/DebugLogManager';

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
