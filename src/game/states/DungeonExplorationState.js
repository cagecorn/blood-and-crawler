import { Scene } from 'phaser';
import { gameStateManager, GameStates } from './GameStateManager';
import { Entity, PositionComponent, StatsComponent } from '../../ecs';

export class DungeonExplorationState extends Scene {
  constructor() {
    super(GameStates.DUNGEON);
  }

  create() {
    this.player = new Entity('player')
      .addComponent(new PositionComponent(0, 0))
      .addComponent(new StatsComponent(100, 10));

    this.add.text(512, 384, 'Dungeon Exploration', {
      fontFamily: 'Arial',
      fontSize: 24,
      color: '#ffffff'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      gameStateManager.changeState(GameStates.COMBAT);
    });
  }
}
