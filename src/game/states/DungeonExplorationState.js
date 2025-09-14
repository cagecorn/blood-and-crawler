import { Scene } from 'phaser';
import { gameStateManager, GameStates } from './GameStateManager';
import { Entity, PositionComponent, StatsComponent } from '../../ecs';
import { MeasurementManager } from '../../MeasurementManager';

export class DungeonExplorationState extends Scene {
  constructor() {
    super(GameStates.DUNGEON);
  }

  create() {
    this.player = new Entity('player')
      .addComponent(new PositionComponent(0, 0))
      .addComponent(new StatsComponent(100, 10));

    const { centerX, centerY } = MeasurementManager;

    this.add.text(centerX, centerY, 'Dungeon Exploration', {
      fontFamily: 'Arial',
      fontSize: MeasurementManager.fontSizes.default,
      color: '#ffffff'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      gameStateManager.changeState(GameStates.COMBAT);
    });
  }
}
