const BASE_PARTY = [
  {
    id: 'aria',
    name: 'Aria the Bold',
    role: 'Frontline Warrior',
    level: 4,
    maxHp: 120,
    currentHp: 120,
    maxMp: 8,
    currentMp: 8,
  },
  {
    id: 'brann',
    name: 'Brann Wildstep',
    role: 'Scout Ranger',
    level: 4,
    maxHp: 95,
    currentHp: 95,
    maxMp: 18,
    currentMp: 18,
  },
  {
    id: 'celine',
    name: 'Celine Ashweaver',
    role: 'Arcane Scholar',
    level: 4,
    maxHp: 70,
    currentHp: 70,
    maxMp: 52,
    currentMp: 52,
  },
  {
    id: 'dorian',
    name: 'Dorian Lightbearer',
    role: 'Cleric Adept',
    level: 4,
    maxHp: 88,
    currentHp: 88,
    maxMp: 44,
    currentMp: 44,
  },
];

export function createBasePartyRoster() {
  return BASE_PARTY.map((member) => ({ ...member }));
}
