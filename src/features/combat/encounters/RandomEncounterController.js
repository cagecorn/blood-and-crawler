import { PLAYER_MOVED } from '../../../events/eventTypes.js';
import { debugLogManager } from '../../../utils/DebugLogManager.js';

const DEFAULT_OPTIONS = {
  encounterChance: 0.18,
  minimumSteps: 3,
};

export class RandomEncounterController {
  constructor({ bus, onEncounter, encounterChance, minimumSteps } = {}) {
    if (!bus) {
      throw new Error('RandomEncounterController requires an event bus');
    }

    this.bus = bus;
    this.onEncounter = onEncounter;

    const options = {
      ...DEFAULT_OPTIONS,
      ...(Number.isFinite(encounterChance) ? { encounterChance } : {}),
      ...(Number.isFinite(minimumSteps) ? { minimumSteps: Math.max(0, minimumSteps) } : {}),
    };

    this.encounterChance = options.encounterChance;
    this.minimumSteps = options.minimumSteps;
    this.stepsSinceLastEncounter = 0;
    this.active = false;
    this.locked = false;
    this.unsubscribe = null;

    this.handlePlayerMoved = this.handlePlayerMoved.bind(this);
  }

  start() {
    if (this.active) {
      return;
    }

    this.unsubscribe = this.bus.on(PLAYER_MOVED, this.handlePlayerMoved);
    this.active = true;
    debugLogManager.log('Random encounter controller started', {
      encounterChance: this.encounterChance,
      minimumSteps: this.minimumSteps,
    });
  }

  stop() {
    if (!this.active) {
      return;
    }

    this.unsubscribe?.();
    this.unsubscribe = null;
    this.active = false;
    this.locked = false;
    this.stepsSinceLastEncounter = 0;
    debugLogManager.log('Random encounter controller stopped');
  }

  destroy() {
    this.stop();
    this.onEncounter = null;
  }

  handlePlayerMoved() {
    if (!this.active || this.locked) {
      return;
    }

    this.stepsSinceLastEncounter += 1;

    if (this.stepsSinceLastEncounter < this.minimumSteps) {
      return;
    }

    if (Math.random() <= this.encounterChance) {
      this.locked = true;
      this.stepsSinceLastEncounter = 0;
      debugLogManager.log('Random encounter triggered');
      this.onEncounter?.();
    }
  }
}
