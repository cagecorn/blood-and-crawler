export const DEFAULT_COMBAT_BACKGROUND = 'combatBackgroundForest';

const ENEMIES = [
  {
    id: 'crypt-zombie',
    name: 'Crypt Zombie',
    level: 3,
    texture: 'monsterZombie',
    description: 'A shambling corpse animated by dungeon miasma.',
    maxHp: 90,
    currentHp: 90,
    backgroundKey: DEFAULT_COMBAT_BACKGROUND,
  },
];

function cloneEnemy(enemy) {
  return { ...enemy };
}

export function getRandomEnemy(randomFn = Math.random) {
  if (ENEMIES.length === 0) {
    throw new Error('No enemies configured for encounters');
  }

  const clampedRandom = Math.min(Math.max(randomFn(), 0), 0.9999999999);
  const index = Math.floor(clampedRandom * ENEMIES.length);
  return cloneEnemy(ENEMIES[index]);
}

export function getDefaultEnemy() {
  return cloneEnemy(ENEMIES[0]);
}
