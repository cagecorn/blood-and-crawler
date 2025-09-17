import { MeasurementManager } from '../../../MeasurementManager.js';
import { DEFAULT_COMBAT_BACKGROUND } from '../data/enemies.js';

const UI_COLORS = {
  overlay: 0x000000,
  panel: 0x0b1623,
  panelStroke: 0x3d6df2,
  row: 0x112235,
  rowStroke: 0x1c3f70,
  rowHover: 0x193452,
  enemyFrame: 0x0d1422,
  enemyFrameStroke: 0x4aa3ff,
};

const UI_ALPHA = {
  overlay: 0.35,
  panel: 0.78,
  row: 0.92,
  enemyFrame: 0.68,
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

  render({ party = [], enemy = {}, backgroundKey = DEFAULT_COMBAT_BACKGROUND, hint } = {}) {
    this.clear();

    this.drawBackground(backgroundKey);
    this.drawEnemy(enemy);
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

  drawEnemy(enemy) {
    const { centerX, centerY } = MeasurementManager;
    const frameWidth = 420;
    const frameHeight = 320;
    const frameY = centerY - 170;

    const frame = this.register(
      this.scene.add.rectangle(centerX, frameY, frameWidth, frameHeight, UI_COLORS.enemyFrame, UI_ALPHA.enemyFrame)
    );
    frame.setStrokeStyle(2, UI_COLORS.enemyFrameStroke);

    const frameTop = frameY - frameHeight / 2;
    const frameBottom = frameY + frameHeight / 2;

    const title = this.register(
      this.scene.add.text(centerX, frameTop + 18, enemy.name ?? 'Unknown Foe', {
        fontFamily: 'Arial Black',
        fontSize: '28px',
        color: '#ffffff',
        align: 'center',
      })
    );
    title.setOrigin(0.5, 0);

    if (enemy.level) {
      const levelBadge = this.register(
        this.scene.add.text(frame.x + frameWidth / 2 - 16, frameTop + 18, `Lv ${enemy.level}`, {
          fontFamily: 'Arial',
          fontSize: '18px',
          color: '#8cb1ff',
        })
      );
      levelBadge.setOrigin(1, 0);
    }

    if (enemy.texture && this.scene.textures.exists(enemy.texture)) {
      const sprite = this.register(
        this.scene.add.image(centerX, frameBottom - 24, enemy.texture)
      );
      sprite.setOrigin(0.5, 1);
      const maxWidth = frameWidth - 80;
      const maxHeight = frameHeight - 96;
      const baseWidth = sprite.width || maxWidth;
      const baseHeight = sprite.height || maxHeight;
      const scale = Math.min(maxWidth / baseWidth, maxHeight / baseHeight);
      if (Number.isFinite(scale) && scale > 0) {
        sprite.setScale(scale);
      } else {
        sprite.setDisplaySize(maxWidth, maxHeight);
      }
    } else {
      const placeholder = this.register(
        this.scene.add.rectangle(centerX, frameBottom - 60, frameWidth - 100, frameHeight - 140, UI_COLORS.row, UI_ALPHA.row)
      );
      placeholder.setOrigin(0.5, 1);
      placeholder.setStrokeStyle(2, UI_COLORS.rowStroke);

      const placeholderText = this.register(
        this.scene.add.text(centerX, frameBottom - 140, 'No enemy art', {
          fontFamily: 'Arial',
          fontSize: '20px',
          color: '#d0d6ff',
        })
      );
      placeholderText.setOrigin(0.5, 0.5);
    }

    if (enemy.description) {
      const description = this.register(
        this.scene.add.text(centerX, frameBottom + 18, enemy.description, {
          fontFamily: 'Arial',
          fontSize: '18px',
          color: '#d0d6ff',
          align: 'center',
          wordWrap: { width: frameWidth + 160 },
        })
      );
      description.setOrigin(0.5, 0);
      description.setAlpha(0.92);
    }
  }

  drawPartyPanel(party) {
    const panelPadding = 14;
    const rowHeight = 60;
    const rowGap = 10;
    const width = 360;
    const rows = Math.max(party.length, 1);
    const height = panelPadding * 2 + rows * rowHeight + (rows - 1) * rowGap;
    const startX = 48;
    const startY = MeasurementManager.screenHeight - height - 48;

    const panel = this.register(
      this.scene.add.rectangle(startX, startY, width, height, UI_COLORS.panel, UI_ALPHA.panel)
    );
    panel.setOrigin(0, 0);
    panel.setStrokeStyle(2, UI_COLORS.panelStroke);

    party.forEach((member, index) => {
      const rowY = startY + panelPadding + index * (rowHeight + rowGap);

      const row = this.register(
        this.scene.add.rectangle(startX + panelPadding, rowY, width - panelPadding * 2, rowHeight, UI_COLORS.row, UI_ALPHA.row)
      );
      row.setOrigin(0, 0);
      row.setStrokeStyle(2, UI_COLORS.rowStroke);

      const nameText = this.register(
        this.scene.add.text(startX + panelPadding + 12, rowY + 6, member.name ?? 'Unknown', {
          fontFamily: 'Arial',
          fontSize: '20px',
          color: '#ffffff',
        })
      );
      nameText.setOrigin(0, 0);

      const roleText = this.register(
        this.scene.add.text(startX + panelPadding + 12, rowY + 32, `Lv ${member.level ?? 1} · ${member.role ?? 'Adventurer'}`, {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: '#8cb1ff',
        })
      );
      roleText.setOrigin(0, 0);

      const hpText = this.register(
        this.scene.add.text(startX + width - panelPadding - 12, rowY + 10, `HP ${member.currentHp ?? 0}/${member.maxHp ?? 0}`, {
          fontFamily: 'Courier',
          fontSize: '18px',
          color: '#7ce8ff',
        })
      );
      hpText.setOrigin(1, 0);

      const mpText = this.register(
        this.scene.add.text(startX + width - panelPadding - 12, rowY + 32, `MP ${member.currentMp ?? 0}/${member.maxMp ?? 0}`, {
          fontFamily: 'Courier',
          fontSize: '16px',
          color: '#caa4ff',
        })
      );
      mpText.setOrigin(1, 0);
    });
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
