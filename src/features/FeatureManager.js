export class FeatureManager {
  constructor() {
    this.features = new Map();
  }

  registerFeature(id, { systems = [], children = [] } = {}) {
    if (this.features.has(id)) {
      throw new Error(`Feature ${id} already registered`);
    }
    this.features.set(id, { id, systems, children, enabled: false });
  }

  enableFeature(id) {
    const feature = this.features.get(id);
    if (!feature || feature.enabled) {
      return;
    }
    feature.enabled = true;
    feature.systems.forEach((system) => system.start?.());
    feature.children.forEach((childId) => this.enableFeature(childId));
  }

  disableFeature(id) {
    const feature = this.features.get(id);
    if (!feature || !feature.enabled) {
      return;
    }
    feature.children.forEach((childId) => this.disableFeature(childId));
    feature.systems.forEach((system) => system.stop?.());
    feature.enabled = false;
  }

  isEnabled(id) {
    return !!this.features.get(id)?.enabled;
  }
}

export const featureManager = new FeatureManager();
