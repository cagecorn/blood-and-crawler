import Phaser from 'phaser';
import { eventBus } from '../events/EventBus.js';

export class DungeonScene extends Phaser.Scene {
  constructor() {
    super('DungeonScene');
  }

  create() {
    // listen for player movement events and update visuals
    eventBus.on('PLAYER_MOVED', ({ x, y }) => {
      // drawing logic placeholder
    });
  }
}
