import { Boot } from './scenes/Boot.js';
import { GameOver } from './scenes/GameOver.js';
import { MainMenu } from './scenes/MainMenu.js';
import { Preloader } from './scenes/Preloader.js';
import { DungeonExplorationState } from './states/DungeonExplorationState.js';
import { CombatState } from './states/CombatState.js';
import { gameStateManager } from './states/GameStateManager.js';
import { AUTO, Game, Scale } from 'phaser';
import { MeasurementManager } from '../MeasurementManager.js';
import { debugLogManager } from '../utils/DebugLogManager.js';

const config = {
    type: AUTO,
    width: MeasurementManager.screenWidth,
    height: MeasurementManager.screenHeight,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        DungeonExplorationState,
        CombatState,
        GameOver
    ]
};

const StartGame = (parent) => {
    debugLogManager.init(import.meta.env?.DEV);
    const game = new Game({ ...config, parent });
    gameStateManager.init(game);
    debugLogManager.log('Game initialized', { parent });
    return game;
}

export default StartGame;
