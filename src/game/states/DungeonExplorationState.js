import { Scene } from 'phaser';
import { gameStateManager, GameStates } from './GameStateManager';
import { Entity, PositionComponent, StatsComponent } from '../../ecs';
import { MeasurementManager } from '../../MeasurementManager';
import { debugLogManager } from '../../utils/DebugLogManager';

export class DungeonExplorationState extends Scene {
  constructor() {
    super(GameStates.DUNGEON);
  }

  create() {
    debugLogManager.log('Dungeon exploration state entered');
    this.player = new Entity('player')
      .addComponent(new PositionComponent(0, 0))
      .addComponent(new StatsComponent(100, 10));
    debugLogManager.log('Player entity created', {
      id: this.player.id,
      stats: this.player.getComponent(StatsComponent)
    });

    const { centerX, centerY } = MeasurementManager;

    this.add.text(centerX, centerY, 'Dungeon Exploration', {
      fontFamily: 'Arial',
      fontSize: MeasurementManager.fontSizes.default,
      color: '#ffffff'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      debugLogManager.log('Dungeon pointerdown');
      gameStateManager.changeState(GameStates.COMBAT);
    });
  }
}
