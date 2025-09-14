import Phaser from 'phaser';
import { eventBus } from '../events/EventBus.js';

export class CombatScene extends Phaser.Scene {
  constructor() {
    super('CombatScene');
  }

  create() {
    eventBus.on('ENEMY_DIED', () => {
      // update combat visuals
    });
  }
}
