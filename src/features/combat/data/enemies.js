import { cloneFormation } from './formation.js';

export const DEFAULT_COMBAT_BACKGROUND = 'combatBackgroundForest';

const ENEMIES = [
  {
    id: 'crypt-zombie-pack',
    name: 'Crypt Zombie Pack',
    level: 3,
    texture: 'monsterZombie',
    description: 'A shambling horde animated by dungeon miasma. Their frontliners shield the cult adepts weaving foul magic in the rear.',
    maxHp: 90,
    currentHp: 90,
    backgroundKey: DEFAULT_COMBAT_BACKGROUND,
    formation: {
      front: [
        {
          id: 'crypt-zombie-vanguard-a',
          name: 'Crypt Zombie',
          texture: 'monsterZombie',
          maxHp: 90,
          currentHp: 90,
        },
        {
          id: 'crypt-zombie-vanguard-b',
          name: 'Crypt Zombie',
          texture: 'monsterZombie',
          maxHp: 90,
          currentHp: 90,
        },
      ],
      back: [
        {
          id: 'crypt-zombie-occultist-a',
          name: 'Occult Ghoul',
          texture: 'monsterZombie',
          maxHp: 75,
          currentHp: 75,
        },
        {
          id: 'crypt-zombie-occultist-b',
          name: 'Fetid Acolyte',
          texture: 'monsterZombie',
          maxHp: 75,
          currentHp: 75,
        },
      ],
    },
  },
];

function cloneEnemy(enemy) {
  const cloned = { ...enemy };

  if (enemy.formation) {
    cloned.formation = cloneFormation(enemy.formation);
  }

  return cloned;
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
