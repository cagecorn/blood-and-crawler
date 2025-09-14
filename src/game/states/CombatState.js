import { Scene } from 'phaser';
import { gameStateManager, GameStates } from './GameStateManager';
import { debugLogManager } from '../../utils/DebugLogManager';

export class CombatState extends Scene {
  constructor() {
    super(GameStates.COMBAT);
  }

  create() {
    debugLogManager.log('Combat state entered');
    this.add.text(512, 384, 'Combat', {
      fontFamily: 'Arial',
      fontSize: 24,
      color: '#ffffff'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      debugLogManager.log('Combat pointerdown');
      gameStateManager.changeState(GameStates.DUNGEON);
    });
  }
}
