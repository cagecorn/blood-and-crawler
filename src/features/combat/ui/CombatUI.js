import { MeasurementManager } from '../../../MeasurementManager.js';
import { DEFAULT_COMBAT_BACKGROUND } from '../data/enemies.js';
import {
  assignUnitsToFormation,
  cloneFormation,
  createEmptyFormation,
  FORMATION_COLUMNS,
  FORMATION_ROWS,
  formationHasUnits,
} from '../data/formation.js';

const UI_COLORS = {
  overlay: 0x000000,
  panel: 0x0b1623,
  panelStroke: 0x3d6df2,
  row: 0x112235,
  rowStroke: 0x1c3f70,
  rowHover: 0x193452,
  enemyFrame: 0x0d1422,
  enemyFrameStroke: 0x4aa3ff,
  partyFrontSlot: 0x1d3557,
  partyBackSlot: 0x14233c,
  partySlotStroke: 0x5ec5ff,
  enemyFrontSlot: 0x5b1d1d,
  enemyBackSlot: 0x351010,
  enemySlotStroke: 0xff9171,
  slotPlaceholder: 0x1f2a3a,
};

const UI_ALPHA = {
  overlay: 0.35,
  panel: 0.78,
  row: 0.92,
  enemyFrame: 0.68,
  slot: 0.88,
  slotBack: 0.82,
};

const FORMATION_STYLES = {
  party: {
    front: { fill: UI_COLORS.partyFrontSlot, alpha: UI_ALPHA.slot },
    back: { fill: UI_COLORS.partyBackSlot, alpha: UI_ALPHA.slotBack },
    stroke: { color: UI_COLORS.partySlotStroke, alpha: 0.95 },
    labelColor: '#7cc4ff',
    nameColor: '#ffffff',
    hpColor: '#9afff7',
    emptyColor: '#6c7ba0',
  },
  enemy: {
    front: { fill: UI_COLORS.enemyFrontSlot, alpha: UI_ALPHA.slot },
    back: { fill: UI_COLORS.enemyBackSlot, alpha: UI_ALPHA.slotBack },
    stroke: { color: UI_COLORS.enemySlotStroke, alpha: 0.95 },
    labelColor: '#ffb59f',
    nameColor: '#ffe7d6',
    hpColor: '#ffb4a2',
    emptyColor: '#8d5151',
  },
};

const COMMANDS = [
  { id: 'attack', label: 'Attack' },
  { id: 'defend', label: 'Defend' },
  { id: 'magic', label: 'Magic' },
  { id: 'item', label: 'Item' },
];

export class CombatUI {
  constructor(scene, { onCommandSelected } = {}) {
    this.scene = scene;
    this.onCommandSelected = onCommandSelected;
    this.objects = [];
    this.commandButtons = [];
  }

  render({
    party = [],
    partyFormation,
    enemy = {},
    enemyFormation,
    backgroundKey = DEFAULT_COMBAT_BACKGROUND,
    hint,
  } = {}) {
    this.clear();

    this.drawBackground(backgroundKey);
    this.drawBattlefield({
      party,
      partyFormation,
      enemy,
      enemyFormation,
    });
    this.drawPartyPanel(party);
    this.drawCommandPanel();

    if (hint) {
      this.drawHint(hint);
    }
  }

  clear() {
    this.commandButtons.forEach(({ button }) => {
      button.removeAllListeners?.();
    });

    this.objects.forEach((obj) => obj.destroy());
    this.objects.length = 0;
    this.commandButtons.length = 0;
  }

  destroy() {
    this.clear();
    this.onCommandSelected = null;
  }

  register(gameObject) {
    if (gameObject.setScrollFactor) {
      gameObject.setScrollFactor(0);
    }
    this.objects.push(gameObject);
    return gameObject;
  }

  drawBackground(backgroundKey) {
    const { centerX, centerY, screenWidth, screenHeight } = MeasurementManager;

    if (backgroundKey && this.scene.textures.exists(backgroundKey)) {
      const background = this.register(
        this.scene.add.image(centerX, centerY, backgroundKey)
      );
      background.setDisplaySize(screenWidth, screenHeight);
      background.setAlpha(0.9);
      background.setDepth(-2);
    }

    const overlay = this.register(
      this.scene.add.rectangle(centerX, centerY, screenWidth, screenHeight, UI_COLORS.overlay, UI_ALPHA.overlay)
    );
    overlay.setDepth(-1);
  }

  drawBattlefield({ party, partyFormation, enemy, enemyFormation }) {
    const resolvedEnemyFormation = this.resolveEnemyFormation(enemyFormation ?? enemy?.formation);
    const resolvedPartyFormation = this.resolvePartyFormation(partyFormation, party);

    this.drawEncounterHeader(enemy);
    this.drawFormationSide('enemy', resolvedEnemyFormation);
    this.drawFormationSide('party', resolvedPartyFormation, {
      title: 'Adventuring Party',
    });
  }

  drawEncounterHeader(enemy = {}) {
    const { centerX, screenWidth } = MeasurementManager;
    const headerY = 48;

    const title = this.register(
      this.scene.add.text(centerX, headerY, enemy.name ?? 'Enemy Forces', {
        fontFamily: 'Arial Black',
        fontSize: '30px',
        color: '#ffe7c1',
        align: 'center',
      })
    );
    title.setOrigin(0.5, 0.5);

    if (enemy.level) {
      const levelText = this.register(
        this.scene.add.text(centerX, headerY + 30, `Encounter Level ${enemy.level}`, {
          fontFamily: 'Arial',
          fontSize: '18px',
          color: '#ffd19a',
        })
      );
      levelText.setOrigin(0.5, 0.5);
      levelText.setAlpha(0.9);
    }

    if (enemy.description) {
      const description = this.register(
        this.scene.add.text(centerX, headerY + 60, enemy.description, {
          fontFamily: 'Arial',
          fontSize: '18px',
          color: '#d0d6ff',
          align: 'center',
          wordWrap: { width: screenWidth - 160 },
        })
      );
      description.setOrigin(0.5, 0.5);
      description.setAlpha(0.9);
    }
  }

  drawFormationSide(side, formation, options = {}) {
    const config = this.getFormationConfig(side);
    const columnPositions = this.getColumnPositions(config);
    const rowCenter = (columnPositions[0] + columnPositions[columnPositions.length - 1]) / 2;
    const hasUnits = formationHasUnits(formation);

    if (options.title) {
      const title = this.register(
        this.scene.add.text(rowCenter, config.backRowY - config.slotHeight / 2 - 30, options.title, {
          fontFamily: 'Arial Black',
          fontSize: '20px',
          color: side === 'party' ? '#9ad8ff' : '#ffb59f',
          align: 'center',
        })
      );
      title.setOrigin(0.5, 0.5);
    }

    ['back', 'front'].forEach((rowKey) => {
      const rowY = rowKey === 'front' ? config.frontRowY : config.backRowY;
      const rowLabel = this.register(
        this.scene.add.text(rowCenter, rowY - config.slotHeight / 2 - 22, this.getRowLabel(rowKey), {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: FORMATION_STYLES[side].labelColor,
          align: 'center',
        })
      );
      rowLabel.setOrigin(0.5, 0.5);
      rowLabel.setAlpha(0.85);

      columnPositions.forEach((x, columnIndex) => {
        const unit = formation?.[rowKey]?.[columnIndex] ?? null;
        this.drawFormationSlot({
          x,
          y: rowY,
          width: config.slotWidth,
          height: config.slotHeight,
          unit,
          side,
          rowKey,
        });
      });
    });

    if (!hasUnits) {
      const placeholder = this.register(
        this.scene.add.text(rowCenter, (config.backRowY + config.frontRowY) / 2, side === 'party' ? 'No allies deployed' : 'No foes present', {
          fontFamily: 'Arial',
          fontSize: '18px',
          color: FORMATION_STYLES[side].emptyColor,
          align: 'center',
        })
      );
      placeholder.setOrigin(0.5, 0.5);
      placeholder.setAlpha(0.75);
    }
  }

  getFormationConfig(side) {
    const slotWidth = 148;
    const slotHeight = 152;
    const columnSpacing = 28;
    const rowSpacing = 34;
    const baseSpacing = slotHeight + rowSpacing;

    if (side === 'enemy') {
      const backRowY = MeasurementManager.centerY - baseSpacing - 32;
      const frontRowY = backRowY + baseSpacing;
      return {
        side,
        align: 'left',
        originX: 200,
        slotWidth,
        slotHeight,
        columnSpacing,
        backRowY,
        frontRowY,
      };
    }

    const backRowY = MeasurementManager.centerY + 24;
    const frontRowY = backRowY + baseSpacing;
    return {
      side,
      align: 'right',
      originX: MeasurementManager.screenWidth - 200,
      slotWidth,
      slotHeight,
      columnSpacing,
      backRowY,
      frontRowY,
    };
  }

  getColumnPositions(config) {
    return Array.from({ length: FORMATION_COLUMNS }, (_, columnIndex) => {
      const offset = columnIndex * (config.slotWidth + config.columnSpacing);
      return config.align === 'right'
        ? config.originX - offset
        : config.originX + offset;
    });
  }

  getRowLabel(rowKey) {
    if (rowKey === 'front') {
      return 'FRONT ROW';
    }
    if (rowKey === 'back') {
      return 'BACK ROW';
    }
    return 'FORMATION';
  }

  drawFormationSlot({ x, y, width, height, unit, side, rowKey }) {
    const style = FORMATION_STYLES[side];
    const rowStyle = style[rowKey === 'front' ? 'front' : 'back'];

    const slot = this.register(
      this.scene.add.rectangle(x, y, width, height, rowStyle.fill, rowStyle.alpha)
    );
    slot.setOrigin(0.5, 0.5);
    slot.setStrokeStyle(2, style.stroke.color, style.stroke.alpha);

    if (unit) {
      const textureKey = this.resolveUnitTexture(unit, side);

      if (textureKey && this.scene.textures.exists(textureKey)) {
        const art = this.register(
          this.scene.add.image(x, y - 12, textureKey)
        );
        this.fitImage(art, width - 28, height - 64);
      } else {
        const placeholder = this.register(
          this.scene.add.rectangle(x, y - 18, width - 36, height - 96, UI_COLORS.slotPlaceholder, 0.6)
        );
        placeholder.setOrigin(0.5, 0.5);
        placeholder.setStrokeStyle(1, style.stroke.color, 0.45);

        const placeholderText = this.register(
          this.scene.add.text(x, y - 18, '???', {
            fontFamily: 'Arial Black',
            fontSize: '24px',
            color: '#ffffff',
          })
        );
        placeholderText.setOrigin(0.5, 0.5);
      }

      const name = unit.name ?? unit.id ?? 'Unknown';
      const nameText = this.register(
        this.scene.add.text(x, y + height / 2 - 36, name, {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: style.nameColor,
          align: 'center',
          wordWrap: { width: width - 20 },
        })
      );
      nameText.setOrigin(0.5, 0.5);

      if (unit.currentHp != null && unit.maxHp != null) {
        const hpText = this.register(
          this.scene.add.text(x, y + height / 2 - 16, `HP ${unit.currentHp}/${unit.maxHp}`, {
            fontFamily: 'Courier',
            fontSize: '14px',
            color: style.hpColor,
          })
        );
        hpText.setOrigin(0.5, 0.5);
      }
    } else {
      const emptyText = this.register(
        this.scene.add.text(x, y, 'Empty', {
          fontFamily: 'Arial',
          fontSize: '18px',
          color: style.emptyColor,
        })
      );
      emptyText.setOrigin(0.5, 0.5);
    }
  }

  resolvePartyFormation(partyFormation, party) {
    if (this.isFormationValid(partyFormation)) {
      return cloneFormation(partyFormation);
    }

    if (Array.isArray(party) && party.length > 0) {
      const { formation } = assignUnitsToFormation(party, { mutate: false });
      return formation;
    }

    return createEmptyFormation();
  }

  resolveEnemyFormation(enemyFormation) {
    if (this.isFormationValid(enemyFormation)) {
      return cloneFormation(enemyFormation);
    }

    return createEmptyFormation();
  }

  isFormationValid(formation) {
    return formation && typeof formation === 'object' && FORMATION_ROWS.every((rowKey) => Array.isArray(formation[rowKey]));
  }

  resolveUnitTexture(unit, side) {
    if (!unit) {
      return null;
    }

    if (side === 'party') {
      return unit.portraitTexture ?? unit.portrait ?? unit.texture ?? null;
    }

    return unit.texture ?? unit.portraitTexture ?? null;
  }

  fitImage(image, maxWidth, maxHeight) {
    const baseWidth = image.width || maxWidth;
    const baseHeight = image.height || maxHeight;
    const scale = Math.min(maxWidth / baseWidth, maxHeight / baseHeight);

    if (Number.isFinite(scale) && scale > 0) {
      image.setScale(scale);
    } else {
      image.setDisplaySize(maxWidth, maxHeight);
    }
  }

  buildPartyInfoLine(member) {
    const rowLabel = this.formatRowLabel(member?.battleRow);
    return `Lv ${member?.level ?? 1} · ${rowLabel} · ${member?.role ?? 'Adventurer'}`;
  }

  formatRowLabel(row) {
    if (row === 'front') {
      return 'Front Row';
    }
    if (row === 'back') {
      return 'Back Row';
    }
    return 'Reserve';
  }

  drawPartyPanel(party) {
    const panelPadding = 16;
    const rowHeight = 88;
    const rowGap = 10;
    const width = 420;
    const rows = Math.max(party.length, 1);
    const height = panelPadding * 2 + rows * rowHeight + (rows - 1) * rowGap;
    const startX = 48;
    const startY = MeasurementManager.screenHeight - height - 48;

    const panel = this.register(
      this.scene.add.rectangle(startX, startY, width, height, UI_COLORS.panel, UI_ALPHA.panel)
    );
    panel.setOrigin(0, 0);
    panel.setStrokeStyle(2, UI_COLORS.panelStroke);

    const portraitSize = 60;

    party.forEach((member, index) => {
      const rowY = startY + panelPadding + index * (rowHeight + rowGap);
      const row = this.register(
        this.scene.add.rectangle(startX + panelPadding, rowY, width - panelPadding * 2, rowHeight, UI_COLORS.row, UI_ALPHA.row)
      );
      row.setOrigin(0, 0);
      row.setStrokeStyle(2, UI_COLORS.rowStroke);

      const portraitCenterX = startX + panelPadding + portraitSize / 2;
      const portraitCenterY = rowY + rowHeight / 2;
      const portraitKey = this.resolveUnitTexture(member, 'party');

      if (portraitKey && this.scene.textures.exists(portraitKey)) {
        const portrait = this.register(
          this.scene.add.image(portraitCenterX, portraitCenterY, portraitKey)
        );
        this.fitImage(portrait, portraitSize, portraitSize);
      } else {
        const portraitPlaceholder = this.register(
          this.scene.add.rectangle(portraitCenterX, portraitCenterY, portraitSize - 8, portraitSize - 8, UI_COLORS.slotPlaceholder, 0.7)
        );
        portraitPlaceholder.setStrokeStyle(1, UI_COLORS.rowStroke, 0.6);

        const placeholderText = this.register(
          this.scene.add.text(portraitCenterX, portraitCenterY, '?', {
            fontFamily: 'Arial Black',
            fontSize: '24px',
            color: '#ffffff',
          })
        );
        placeholderText.setOrigin(0.5, 0.5);
      }

      const textStartX = startX + panelPadding + portraitSize + 16;

      const nameText = this.register(
        this.scene.add.text(textStartX, rowY + 8, member.name ?? 'Unknown', {
          fontFamily: 'Arial',
          fontSize: '20px',
          color: '#ffffff',
        })
      );
      nameText.setOrigin(0, 0);

      const infoText = this.register(
        this.scene.add.text(textStartX, rowY + 36, this.buildPartyInfoLine(member), {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: '#8cb1ff',
        })
      );
      infoText.setOrigin(0, 0);

      const hpText = this.register(
        this.scene.add.text(startX + width - panelPadding - 12, rowY + 16, `HP ${member.currentHp ?? 0}/${member.maxHp ?? 0}`, {
          fontFamily: 'Courier',
          fontSize: '18px',
          color: '#7ce8ff',
        })
      );
      hpText.setOrigin(1, 0);

      const mpText = this.register(
        this.scene.add.text(startX + width - panelPadding - 12, rowY + 40, `MP ${member.currentMp ?? 0}/${member.maxMp ?? 0}`, {
          fontFamily: 'Courier',
          fontSize: '16px',
          color: '#caa4ff',
        })
      );
      mpText.setOrigin(1, 0);
    });

    if (party.length === 0) {
      const placeholder = this.register(
        this.scene.add.text(startX + width / 2, startY + height / 2, 'No party members assigned', {
          fontFamily: 'Arial',
          fontSize: '18px',
          color: '#d0d6ff',
          align: 'center',
          wordWrap: { width: width - panelPadding * 2 },
        })
      );
      placeholder.setOrigin(0.5, 0.5);
      placeholder.setAlpha(0.8);
    }
  }

  drawCommandPanel() {
    const padding = 12;
    const rowHeight = 56;
    const rowGap = 10;
    const width = 240;
    const rows = COMMANDS.length;
    const height = padding * 2 + rows * rowHeight + (rows - 1) * rowGap;
    const startX = MeasurementManager.screenWidth - width - 48;
    const startY = MeasurementManager.screenHeight - height - 48;

    const panel = this.register(
      this.scene.add.rectangle(startX, startY, width, height, UI_COLORS.panel, UI_ALPHA.panel)
    );
    panel.setOrigin(0, 0);
    panel.setStrokeStyle(2, UI_COLORS.panelStroke);

    COMMANDS.forEach((command, index) => {
      const rowY = startY + padding + index * (rowHeight + rowGap);
      this.createCommandButton(startX + padding, rowY, width - padding * 2, rowHeight, command);
    });
  }

  createCommandButton(x, y, width, height, command) {
    const button = this.register(
      this.scene.add.rectangle(x, y, width, height, UI_COLORS.row, UI_ALPHA.row)
    );
    button.setOrigin(0, 0);
    button.setStrokeStyle(2, UI_COLORS.rowStroke);
    button.setInteractive({ useHandCursor: true });

    button.on('pointerover', () => {
      button.setFillStyle(UI_COLORS.rowHover, 1);
    });

    button.on('pointerout', () => {
      button.setFillStyle(UI_COLORS.row, UI_ALPHA.row);
    });

    button.on('pointerdown', () => {
      this.onCommandSelected?.(command.id);
    });

    const label = this.register(
      this.scene.add.text(x + width / 2, y + height / 2, command.label, {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#ffffff',
      })
    );
    label.setOrigin(0.5, 0.5);

    this.commandButtons.push({ button, command });
  }

  drawHint(hint) {
    const hintText = this.register(
      this.scene.add.text(MeasurementManager.centerX, MeasurementManager.screenHeight - 16, hint, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#d0d6ff',
        align: 'center',
      })
    );
    hintText.setOrigin(0.5, 1);
    hintText.setAlpha(0.85);
  }
}
