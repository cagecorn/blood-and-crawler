import { Scene } from 'phaser';
import { gameStateManager, GameStates } from './GameStateManager.js';
import { Entity, PositionComponent, StatsComponent } from '../../ecs/index.js';
import { MeasurementManager } from '../../MeasurementManager.js';
import { debugLogManager } from '../../utils/DebugLogManager.js';
import { generateDungeon } from '../../features/dungeon/recursiveBacktrackingGenerator.js';

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
    const dungeon = generateDungeon(21, 21);
    const tileSize = 32;
    const offsetX = (MeasurementManager.screenWidth - dungeon[0].length * tileSize) / 2;
    const offsetY = (MeasurementManager.screenHeight - dungeon.length * tileSize) / 2;

    for (let y = 0; y < dungeon.length; y++) {
      for (let x = 0; x < dungeon[0].length; x++) {
        const texture = dungeon[y][x] === 1 ? 'dungeonWall' : 'dungeonFloor';
        this.add
          .image(
            offsetX + x * tileSize + tileSize / 2,
            offsetY + y * tileSize + tileSize / 2,
            texture
          )
          .setDisplaySize(tileSize, tileSize);
      }
    }

    this.input.once('pointerdown', () => {
      debugLogManager.log('Dungeon pointerdown');
      gameStateManager.changeState(GameStates.COMBAT);
    });
  }
}
