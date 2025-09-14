export class Entity {
  constructor(id) {
    this.id = id;
    this.components = new Map();
  }

  addComponent(component) {
    this.components.set(component.constructor, component);
    return this;
  }

  getComponent(componentClass) {
    return this.components.get(componentClass);
  }

  hasComponent(componentClass) {
    return this.components.has(componentClass);
  }
}
