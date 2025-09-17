import { Scene } from 'phaser';
import { gameStateManager, GameStates } from './GameStateManager.js';
import { debugLogManager } from '../../utils/DebugLogManager.js';
import { CombatUI } from '../../features/combat/ui/CombatUI.js';
import { createBasePartyRoster } from '../../features/combat/data/partyRoster.js';
import { DEFAULT_COMBAT_BACKGROUND, getDefaultEnemy } from '../../features/combat/data/enemies.js';

export class CombatState extends Scene {
  constructor() {
    super(GameStates.COMBAT);
  }

  init(data) {
    this.encounterData = data;
  }

  create() {
    debugLogManager.log('Combat state entered', {
      encounterType: this.encounterData?.encounterType ?? 'UNKNOWN',
    });

    this.cameras.main.setBackgroundColor('#050816');

    const preparedEncounter = this.prepareEncounterData(this.encounterData);

    this.combatUI = new CombatUI(this, {
      onCommandSelected: (command) => this.handleCommandSelection(command),
    });

    this.combatUI.render({
      party: preparedEncounter.party,
      enemy: preparedEncounter.enemy,
      backgroundKey: preparedEncounter.backgroundKey,
      hint: 'Press ESC to return to exploration',
    });

    this.registerInputHandlers();
  }

  prepareEncounterData(data = {}) {
    const enemy = this.normalizeEnemyData(data.enemy);
    return {
      party: this.normalizePartyData(data.party),
      enemy,
      backgroundKey: data.backgroundKey ?? enemy.backgroundKey ?? DEFAULT_COMBAT_BACKGROUND,
    };
  }

  normalizePartyData(partyData) {
    const source = Array.isArray(partyData) && partyData.length > 0
      ? partyData
      : createBasePartyRoster();

    return source.map((member) => {
      const maxHp = this.safeNumber(member.maxHp ?? member.hp ?? member.currentHp, 0);
      const currentHp = this.safeNumber(member.currentHp ?? member.hp ?? maxHp, maxHp);
      const maxMp = this.safeNumber(member.maxMp ?? member.mp ?? member.currentMp, 0);
      const currentMp = this.safeNumber(member.currentMp ?? member.mp ?? maxMp, maxMp);

      return {
        ...member,
        level: member.level ?? 1,
        role: member.role ?? 'Adventurer',
        maxHp,
        currentHp,
        maxMp,
        currentMp,
      };
    });
  }

  normalizeEnemyData(enemyData) {
    const enemy = enemyData ? { ...enemyData } : getDefaultEnemy();
    enemy.maxHp = this.safeNumber(enemy.maxHp ?? enemy.currentHp, 0);
    enemy.currentHp = this.safeNumber(enemy.currentHp ?? enemy.maxHp, enemy.maxHp);
    enemy.level = enemy.level ?? 1;
    return enemy;
  }

  safeNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  registerInputHandlers() {
    this.input.keyboard.on('keydown-ESC', this.handleEscape, this);

    const teardown = () => {
      this.input.keyboard?.off('keydown-ESC', this.handleEscape, this);
      this.combatUI?.destroy();
      this.combatUI = null;
      this.encounterData = null;
    };

    this.events.once('shutdown', teardown);
    this.events.once('destroy', teardown);
  }

  handleCommandSelection(command) {
    debugLogManager.log('Combat command selected', { command });
  }

  handleEscape() {
    debugLogManager.log('Exit combat requested');
    gameStateManager.changeState(GameStates.DUNGEON);
  }
}
