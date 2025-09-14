import { magicSystem } from './systems/magicSystem.js';
import { itemSystem } from './systems/itemSystem.js';
import { targetingSystem } from './systems/targetingSystem.js';

export const WIZARDRY_COMBAT = 'WIZARDRY_COMBAT';

export function registerWizardryCombatFeature(manager) {
  manager.registerFeature(WIZARDRY_COMBAT, {
    systems: [magicSystem, itemSystem, targetingSystem],
  });
}
