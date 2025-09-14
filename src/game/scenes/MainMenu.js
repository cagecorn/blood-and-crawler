import { Scene } from 'phaser';
import { gameStateManager, GameStates } from '../states/GameStateManager.js';
import { MeasurementManager } from '../../MeasurementManager.js';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        const { centerX, centerY, mainMenu } = MeasurementManager;

        this.add.image(centerX, centerY, 'background');

        this.add.image(centerX, centerY + mainMenu.logoOffsetY, 'logo');

        this.add.text(centerX, centerY + mainMenu.titleOffsetY, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: MeasurementManager.fontSizes.mainMenuTitle, color: '#ffffff',
            stroke: '#000000', strokeThickness: MeasurementManager.strokeThickness,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {
            gameStateManager.changeState(GameStates.DUNGEON);
        });
    }
}
