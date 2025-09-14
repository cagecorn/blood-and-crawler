import { Scene } from 'phaser';
import { GameStates } from './GameStateManager.js';
import { Entity, PositionComponent, StatsComponent } from '../../ecs/index.js';
import { MeasurementManager } from '../../MeasurementManager.js';
import { debugLogManager } from '../../utils/DebugLogManager.js';
import { generateDungeon } from '../../features/dungeon/recursiveBacktrackingGenerator.js';
import { eventBus } from '../../events/EventBus.js';
import { PLAYER_MOVED } from '../../events/eventTypes.js';
import { turnManager } from '../../systems/turnManager.js';
import { aiSystem } from '../../systems/aiSystem.js';
import { raycastFOV } from '../../features/fov/index.js';

export class DungeonExplorationState extends Scene {
  constructor() {
    super(GameStates.DUNGEON);
  }

  create() {
    debugLogManager.log('Dungeon exploration state entered');

    this.bus = eventBus;
    this.turn = turnManager(this.bus);
    this.turn.init();
    aiSystem(this.bus).init();

    this.dungeon = generateDungeon(21, 21);
    this.tileSize = 32;
    this.offsetX =
      (MeasurementManager.screenWidth - this.dungeon[0].length * this.tileSize) / 2;
    this.offsetY =
      (MeasurementManager.screenHeight - this.dungeon.length * this.tileSize) / 2;

    this.player = new Entity('player')
      .addComponent(new PositionComponent(1, 1))
      .addComponent(new StatsComponent(100, 10));

    this.playerSprite = this.add.rectangle(
      this.offsetX + this.tileSize / 2,
      this.offsetY + this.tileSize / 2,
      this.tileSize * 0.8,
      this.tileSize * 0.8,
      0x00ff00
    );

    for (let y = 0; y < this.dungeon.length; y++) {
      for (let x = 0; x < this.dungeon[0].length; x++) {
        const texture = this.dungeon[y][x] === 1 ? 'dungeonWall' : 'dungeonFloor';
        this.add
          .image(
            this.offsetX + x * this.tileSize + this.tileSize / 2,
            this.offsetY + y * this.tileSize + this.tileSize / 2,
            texture
          )
          .setDisplaySize(this.tileSize, this.tileSize);
      }
    }

    this.input.keyboard.on('keydown', (event) => {
      if (!this.turn.canPlayerAct()) return;
      const pos = this.player.getComponent(PositionComponent);
      let dx = 0;
      let dy = 0;
      switch (event.key) {
        case 'ArrowUp':
          dy = -1;
          break;
        case 'ArrowDown':
          dy = 1;
          break;
        case 'ArrowLeft':
          dx = -1;
          break;
        case 'ArrowRight':
          dx = 1;
          break;
        default:
          return;
      }
      const nx = pos.x + dx;
      const ny = pos.y + dy;
      if (this.dungeon[ny]?.[nx] !== 1) {
        pos.x = nx;
        pos.y = ny;
        this.playerSprite.setPosition(
          this.offsetX + nx * this.tileSize + this.tileSize / 2,
          this.offsetY + ny * this.tileSize + this.tileSize / 2
        );
        this.bus.emit(PLAYER_MOVED, { id: this.player.id, x: nx, y: ny });
        this.updateFOV();
      }
    });

    this.updateFOV();
  }

  updateFOV() {
    const pos = this.player.getComponent(PositionComponent);
    const tiles = raycastFOV(this.dungeon, { x: pos.x, y: pos.y }, 8);
    debugLogManager.log('FOV updated', { visibleTiles: tiles.size });
  }
}
