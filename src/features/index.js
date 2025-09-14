import { featureManager } from './FeatureManager.js';
import { registerWizardryCombatFeature, WIZARDRY_COMBAT } from './combat/wizardryCombatFeature.js';

// Central place to register all features and their initial flags
const featureFlags = {
  [WIZARDRY_COMBAT]: true,
};

registerWizardryCombatFeature(featureManager);

Object.entries(featureFlags).forEach(([id, enabled]) => {
  if (enabled) {
    featureManager.enableFeature(id);
  }
});

export { featureManager, featureFlags };
