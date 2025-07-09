// playerSprites.ts
import Phaser from 'phaser';
import { SPRITES, SIZES } from '../utils/constants';

interface PlayerSprites {
    physicalBody: Phaser.Physics.Arcade.Sprite;
    bodySprite: Phaser.GameObjects.Sprite;
    head: Phaser.GameObjects.Sprite;
    hand: Phaser.GameObjects.Sprite;
    weapon: Phaser.GameObjects.Sprite;
    originalBodyHeight: number;
    originalBodyOffsetY: number;
    originalHeadY: number;
    originalHandY: number;
    originalWeaponY: number;
}

export function createPlayerSprites(scene: Phaser.Scene, x: number, y: number, texture: string): PlayerSprites {
    const physicalBody = new Phaser.Physics.Arcade.Sprite(scene, x, y, texture, 0);
    scene.physics.add.existing(physicalBody);
    physicalBody.setGravityY(1100);
    physicalBody.setCollideWorldBounds(true);

    const bodyHeight = SIZES.PLAYER.BODY_HEIGHT * 0.5;
    const headOffset = 12;
    const totalHeight = bodyHeight + headOffset;
    physicalBody.setSize(SIZES.PLAYER.BODY_WIDTH * 0.3, totalHeight);
    physicalBody.setOffset(2.9 * headOffset, headOffset);

    const bodySprite = new Phaser.GameObjects.Sprite(scene, 0, 0, texture, 0);
    bodySprite.setOrigin(0.5, 0.5);
    bodySprite.setScale(0.5);

    const head = new Phaser.GameObjects.Sprite(scene, 0, -27, SPRITES.PLAYER.HEAD, 0);
    head.setOrigin(0.5, 0.8);
    head.setScale(0.5);

    const hand = new Phaser.GameObjects.Sprite(scene, -8, -20, SPRITES.PLAYER.HAND, 0);
    hand.setScale(0.5);

    const weapon = new Phaser.GameObjects.Sprite(scene, 8, -20, SPRITES.WEAPON.GUN, 0);
    weapon.setScale(0.5);

    return {
        physicalBody,
        bodySprite,
        head,
        hand,
        weapon,
        originalBodyHeight: totalHeight,
        originalBodyOffsetY: headOffset,
        originalHeadY: -27,
        originalHandY: -20,
        originalWeaponY: -20
    };
}