// Centralized game state: holds all world and entity data

export const state = {
  world: {},
  entities: new Map()
};

let nextId = 1;
export const createEntity = (components = {}) => {
  const id = nextId++;
  state.entities.set(id, components);
  return id;
};
