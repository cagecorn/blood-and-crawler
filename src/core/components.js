// Core component definitions: pure data only
// Example components used by entities in the global state

export const Position = (x = 0, y = 0) => ({ x, y });

export const Stats = (hp = 100, mp = 0) => ({ hp, mp });
