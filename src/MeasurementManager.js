export class MeasurementManager {
  static screenWidth = 1024;
  static screenHeight = 768;

  static get centerX() {
    return this.screenWidth / 2;
  }

  static get centerY() {
    return this.screenHeight / 2;
  }

  static progressBar = {
    width: 468,
    height: 32,
    offsetX: 230,
    fillStartWidth: 4,
    fillHeight: 28,
    fillMaxWidth: 460,
  };

  static mainMenu = {
    logoOffsetY: -84,
    titleOffsetY: 76,
  };

  static fontSizes = {
    default: 24,
    mainMenuTitle: 38,
    gameOverTitle: 64,
  };

  static strokeThickness = 8;
}
