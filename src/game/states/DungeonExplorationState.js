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

    this.initializeSystems();
    this.generateDungeonLayout();
    this.createDungeonTiles();
    this.createPlayer();
    this.setupCamera();
    this.setupInputHandlers();

    this.updateFOV();
  }

  initializeSystems() {
    this.bus = eventBus;
    this.turn = turnManager(this.bus);
    this.turn.init();
    aiSystem(this.bus).init();
  }

  generateDungeonLayout() {
    this.dungeon = generateDungeon(21, 21);
    this.tileSize = 32;
    this.mapWidth = this.dungeon[0].length * this.tileSize;
    this.mapHeight = this.dungeon.length * this.tileSize;
  }

  createDungeonTiles() {
    for (let y = 0; y < this.dungeon.length; y++) {
      for (let x = 0; x < this.dungeon[0].length; x++) {
        const texture = this.dungeon[y][x] === 1 ? 'dungeonWall' : 'dungeonFloor';
        this.add
          .image(
            this.toWorldX(x),
            this.toWorldY(y),
            texture
          )
          .setDisplaySize(this.tileSize, this.tileSize);
      }
    }
  }

  createPlayer() {
    const spawnTile = this.findSpawnTile();
    this.player = new Entity('player')
      .addComponent(new PositionComponent(spawnTile.x, spawnTile.y))
      .addComponent(new StatsComponent(100, 10));

    this.playerSprite = this.add
      .sprite(0, 0, 'playerWarrior')
      .setDisplaySize(this.tileSize, this.tileSize)
      .setDepth(1);

    this.updatePlayerSpritePosition();
  }

  findSpawnTile() {
    const width = this.dungeon[0].length;
    const height = this.dungeon.length;
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);

    const queue = [[centerX, centerY]];
    const visited = new Set([`${centerX},${centerY}`]);

    const enqueue = (x, y) => {
      if (x < 0 || x >= width || y < 0 || y >= height) {
        return;
      }
      const key = `${x},${y}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push([x, y]);
      }
    };

    while (queue.length > 0) {
      const [x, y] = queue.shift();
      if (this.isWalkable(x, y)) {
        return { x, y };
      }

      enqueue(x + 1, y);
      enqueue(x - 1, y);
      enqueue(x, y + 1);
      enqueue(x, y - 1);
    }

    throw new Error('Unable to find walkable tile for player spawn');
  }

  setupCamera() {
    const horizontalMargin = MeasurementManager.screenWidth / 2;
    const verticalMargin = MeasurementManager.screenHeight / 2;

    this.cameras.main.setBounds(
      -horizontalMargin,
      -verticalMargin,
      this.mapWidth + horizontalMargin * 2,
      this.mapHeight + verticalMargin * 2
    );
    this.cameras.main.startFollow(this.playerSprite, true, 0.15, 0.15);
    this.cameras.main.centerOn(this.playerSprite.x, this.playerSprite.y);
    this.cameras.main.roundPixels = true;

    this.zoomConfig = {
      min: 0.5,
      max: 2,
      step: 0.1,
      default: 1,
    };
    this.currentZoom = this.zoomConfig.default;
    this.cameras.main.setZoom(this.currentZoom);
  }

  setupInputHandlers() {
    this.directionByKey = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      w: { x: 0, y: -1 },
      s: { x: 0, y: 1 },
      a: { x: -1, y: 0 },
      d: { x: 1, y: 0 },
    };

    this.input.keyboard.on('keydown', this.handleKeyDown, this);
    this.input.on('wheel', this.handleWheelZoom, this);

    const removeListeners = () => {
      this.input.keyboard.off('keydown', this.handleKeyDown, this);
      this.input.off('wheel', this.handleWheelZoom, this);
    };

    this.events.once('shutdown', removeListeners);
    this.events.once('destroy', removeListeners);
  }

  handleKeyDown(event) {
    if (this.processZoomInput(event.key)) {
      event.preventDefault();
      return;
    }

    if (!this.turn.canPlayerAct()) {
      return;
    }

    if (this.processMovementInput(event)) {
      event.preventDefault();
    }
  }

  processMovementInput(event) {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    const direction = this.directionByKey[key];
    if (!direction) {
      return false;
    }

    this.tryMovePlayer(direction.x, direction.y);
    return true;
  }

  tryMovePlayer(dx, dy) {
    const position = this.player.getComponent(PositionComponent);
    const targetX = position.x + dx;
    const targetY = position.y + dy;

    if (!this.isWalkable(targetX, targetY)) {
      return false;
    }

    position.x = targetX;
    position.y = targetY;
    this.updatePlayerSpritePosition();

    this.bus.emit(PLAYER_MOVED, { id: this.player.id, x: targetX, y: targetY });
    this.updateFOV();

    return true;
  }

  handleWheelZoom(_pointer, _gameObjects, _deltaX, deltaY) {
    const direction = deltaY > 0 ? -1 : 1;
    this.adjustZoom(direction);
  }

  processZoomInput(key) {
    switch (key) {
      case '+':
      case '=':
        this.adjustZoom(1);
        return true;
      case '-':
      case '_':
        this.adjustZoom(-1);
        return true;
      case '0':
      case ')':
        this.resetZoom();
        return true;
      default:
        return false;
    }
  }

  adjustZoom(direction) {
    const nextZoom = this.currentZoom + direction * this.zoomConfig.step;
    this.setZoom(nextZoom);
  }

  setZoom(zoomValue) {
    const clamped = Math.min(this.zoomConfig.max, Math.max(this.zoomConfig.min, zoomValue));
    this.currentZoom = Number(clamped.toFixed(2));
    this.cameras.main.setZoom(this.currentZoom);
  }

  resetZoom() {
    this.setZoom(this.zoomConfig.default);
  }

  isWalkable(x, y) {
    return this.dungeon[y]?.[x] === 0;
  }

  toWorldX(tileX) {
    return tileX * this.tileSize + this.tileSize / 2;
  }

  toWorldY(tileY) {
    return tileY * this.tileSize + this.tileSize / 2;
  }

  updatePlayerSpritePosition() {
    const position = this.player.getComponent(PositionComponent);
    this.playerSprite.setPosition(this.toWorldX(position.x), this.toWorldY(position.y));
  }

  updateFOV() {
    const pos = this.player.getComponent(PositionComponent);
    const tiles = raycastFOV(this.dungeon, { x: pos.x, y: pos.y }, 8);
    debugLogManager.log('FOV updated', { visibleTiles: tiles.size });
  }
}
