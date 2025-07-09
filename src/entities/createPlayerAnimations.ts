// playerAnimations.ts
import Phaser from 'phaser';

export function createPlayerAnimations(scene: Phaser.Scene, textureKey: string) {
    const anims = scene.anims;
    const animsFrameRate = 9;

    anims.create({
        key: 'run_right',
        frames: anims.generateFrameNumbers(textureKey, { start: 3, end: 5 }),
        frameRate: animsFrameRate,
        repeat: -1
    });

    anims.create({
        key: 'run_left',
        frames: anims.generateFrameNumbers(textureKey, { start: 8, end: 6 }),
        frameRate: animsFrameRate,
        repeat: -1
    });

    anims.create({
        key: 'run_right_reverse',
        frames: anims.generateFrameNumbers(textureKey, { start: 5, end: 3 }),
        frameRate: animsFrameRate,
        repeat: -1
    });

    anims.create({
        key: 'run_left_reverse',
        frames: anims.generateFrameNumbers(textureKey, { start: 6, end: 8 }),
        frameRate: animsFrameRate,
        repeat: -1
    });
}