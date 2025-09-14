import { Scene } from 'phaser';
import { MeasurementManager } from '../../MeasurementManager.js';

export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(0xff0000);

        const { centerX, centerY } = MeasurementManager;

        this.add.image(centerX, centerY, 'background').setAlpha(0.5);

        this.add.text(centerX, centerY, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: MeasurementManager.fontSizes.gameOverTitle, color: '#ffffff',
            stroke: '#000000', strokeThickness: MeasurementManager.strokeThickness,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('MainMenu');

        });
    }
}
