import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { DungeonExplorationState } from './states/DungeonExplorationState';
import { CombatState } from './states/CombatState';
import { gameStateManager } from './states/GameStateManager';
import { AUTO, Game } from 'phaser';
import { MeasurementManager } from '../MeasurementManager';

const config = {
    type: AUTO,
    width: MeasurementManager.screenWidth,
    height: MeasurementManager.screenHeight,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
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
    const game = new Game({ ...config, parent });
    gameStateManager.init(game);
    return game;
}

export default StartGame;
